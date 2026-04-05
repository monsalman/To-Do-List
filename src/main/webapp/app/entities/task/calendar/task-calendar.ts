import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ITask, ITaskGroup } from '../task.model';
import { TaskService } from '../service/task.service';
import { TaskGroupService } from '../service/task-group.service';
import { I18nService } from 'app/shared/i18n/i18n.service';
import { TranslatePipe } from 'app/shared/i18n/translate.pipe';
import { TaskFormDialog } from '../form/task-form-dialog';
import { TaskDeleteDialog } from '../delete/task-delete-dialog';

interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: ITask[];
}

@Component({
  selector: 'app-task-calendar',
  templateUrl: './task-calendar.html',
  styleUrl: './task-calendar.scss',
  imports: [CommonModule, TranslatePipe, TaskFormDialog, TaskDeleteDialog],
})
export default class TaskCalendar implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly taskGroupService = inject(TaskGroupService);
  readonly i18n = inject(I18nService);

  currentDate = signal(new Date());
  tasks = signal<ITask[]>([]);
  groups = signal<ITaskGroup[]>([]);
  selectedDay = signal<CalendarDay | null>(null);

  showFormDialog = signal(false);
  editingTask = signal<ITask | null>(null);
  showDeleteDialog = signal(false);
  deletingTask = signal<ITask | null>(null);

  readonly weekDays = computed(() => {
    const keys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return keys.map(k => this.i18n.t(`calendar.${k}`));
  });

  readonly monthName = computed(() => {
    const months = [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december',
    ];
    return this.i18n.t(`calendar.${months[this.currentDate().getMonth()]}`);
  });

  readonly year = computed(() => this.currentDate().getFullYear());

  readonly calendarDays = computed(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay();

    const days: CalendarDay[] = [];
    const today = new Date();
    const todayStr = this.formatDateISO(today);
    const taskMap = this.buildTaskMap();

    // Previous month padding
    const prevMonthLast = new Date(year, month, 0);
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLast.getDate() - i);
      days.push({
        date: d,
        dayOfMonth: d.getDate(),
        isCurrentMonth: false,
        isToday: false,
        tasks: taskMap.get(this.formatDateISO(d)) || [],
      });
    }

    // Current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const d = new Date(year, month, day);
      const dateStr = this.formatDateISO(d);
      days.push({
        date: d,
        dayOfMonth: day,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        tasks: taskMap.get(dateStr) || [],
      });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        dayOfMonth: i,
        isCurrentMonth: false,
        isToday: false,
        tasks: taskMap.get(this.formatDateISO(d)) || [],
      });
    }

    return days;
  });

  ngOnInit(): void {
    this.loadTasks();
    this.loadGroups();
  }

  loadTasks(): void {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const from = this.formatDateISO(new Date(year, month - 1, 1));
    const to = this.formatDateISO(new Date(year, month + 2, 0));
    this.taskService.getByDateRange(from, to).subscribe(tasks => this.tasks.set(tasks));
  }

  loadGroups(): void {
    this.taskGroupService.getAll().subscribe(groups => this.groups.set(groups));
  }

  prevMonth(): void {
    const d = this.currentDate();
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
    this.selectedDay.set(null);
    this.loadTasks();
  }

  nextMonth(): void {
    const d = this.currentDate();
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
    this.selectedDay.set(null);
    this.loadTasks();
  }

  goToToday(): void {
    this.currentDate.set(new Date());
    this.selectedDay.set(null);
    this.loadTasks();
  }

  selectDay(day: CalendarDay): void {
    this.selectedDay.set(day);
  }

  openCreateForDay(day: CalendarDay): void {
    this.editingTask.set({ dueDate: this.formatDateISO(day.date) });
    this.showFormDialog.set(true);
  }

  openEditDialog(task: ITask): void {
    this.editingTask.set({ ...task });
    this.showFormDialog.set(true);
  }

  openDeleteDialog(task: ITask): void {
    this.deletingTask.set(task);
    this.showDeleteDialog.set(true);
  }

  onFormSaved(): void {
    this.showFormDialog.set(false);
    this.loadTasks();
  }

  onFormCancelled(): void {
    this.showFormDialog.set(false);
  }

  onDeleteConfirmed(): void {
    this.showDeleteDialog.set(false);
    this.loadTasks();
  }

  onDeleteCancelled(): void {
    this.showDeleteDialog.set(false);
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'var(--status-pending)',
      IN_PROGRESS: 'var(--status-in-progress)',
      DONE: 'var(--status-done)',
    };
    return map[status] || 'var(--text-muted)';
  }

  getPriorityLabel(priority: string): string {
    return this.i18n.t(`task.${priority.toLowerCase()}`);
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'pendingStatus',
      IN_PROGRESS: 'inProgressStatus',
      DONE: 'doneStatus',
    };
    return this.i18n.t(`task.${map[status] || 'pendingStatus'}`);
  }

  private buildTaskMap(): Map<string, ITask[]> {
    const map = new Map<string, ITask[]>();
    for (const task of this.tasks()) {
      if (task.dueDate) {
        const dateStr = task.dueDate;
        if (!map.has(dateStr)) map.set(dateStr, []);
        map.get(dateStr)!.push(task);
      }
    }
    return map;
  }

  private formatDateISO(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
