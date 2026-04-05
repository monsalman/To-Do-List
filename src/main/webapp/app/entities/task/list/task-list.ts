import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ITask, ITaskGroup } from '../task.model';
import { TaskService } from '../service/task.service';
import { TaskGroupService } from '../service/task-group.service';
import { I18nService } from 'app/shared/i18n/i18n.service';
import { TranslatePipe } from 'app/shared/i18n/translate.pipe';
import { TaskFormDialog } from '../form/task-form-dialog';
import { TaskDeleteDialog } from '../delete/task-delete-dialog';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
  imports: [CommonModule, FormsModule, FontAwesomeModule, TranslatePipe, TaskFormDialog, TaskDeleteDialog],
})
export default class TaskList implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly taskGroupService = inject(TaskGroupService);
  readonly i18n = inject(I18nService);

  tasks = signal<ITask[]>([]);
  groups = signal<ITaskGroup[]>([]);
  filterStatus = signal<string>('ALL');
  filterPriority = signal<string>('ALL');
  searchQuery = signal<string>('');

  showFormDialog = signal(false);
  editingTask = signal<ITask | null>(null);
  showDeleteDialog = signal(false);
  deletingTask = signal<ITask | null>(null);

  filteredTasks = computed(() => {
    let result = this.tasks();
    const status = this.filterStatus();
    const priority = this.filterPriority();
    const query = this.searchQuery().toLowerCase();

    if (status !== 'ALL') {
      result = result.filter(t => t.status === status);
    }
    if (priority !== 'ALL') {
      result = result.filter(t => t.priority === priority);
    }
    if (query) {
      result = result.filter(t => t.title?.toLowerCase().includes(query) || t.description?.toLowerCase().includes(query));
    }
    return result;
  });

  ngOnInit(): void {
    this.loadTasks();
    this.loadGroups();
  }

  loadTasks(): void {
    this.taskService.getAll().subscribe(tasks => this.tasks.set(tasks));
  }

  loadGroups(): void {
    this.taskGroupService.getAll().subscribe(groups => this.groups.set(groups));
  }

  openCreateDialog(): void {
    this.editingTask.set(null);
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

  toggleStatus(task: ITask): void {
    const statusOrder: ITask['status'][] = ['PENDING', 'IN_PROGRESS', 'DONE'];
    const currentIndex = statusOrder.indexOf(task.status!);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    this.taskService.update(task.id!, { ...task, status: nextStatus }).subscribe(() => {
      this.loadTasks();
    });
  }

  getPriorityClass(priority: string): string {
    return `td-badge td-badge-priority-${priority.toLowerCase()}`;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'td-badge td-badge-status-pending',
      IN_PROGRESS: 'td-badge td-badge-status-in-progress',
      DONE: 'td-badge td-badge-status-done',
    };
    return map[status] || 'td-badge';
  }

  isOverdue(task: ITask): boolean {
    if (!task.dueDate || task.status === 'DONE') return false;
    return new Date(task.dueDate) < new Date(new Date().toDateString());
  }

  isToday(task: ITask): boolean {
    if (!task.dueDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return task.dueDate === today;
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return this.i18n.t('task.noDueDate');
    const date = new Date(dateStr);
    return date.toLocaleDateString(this.i18n.currentLang() === 'id' ? 'id-ID' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
}
