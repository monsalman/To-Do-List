import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AccountService } from 'app/core/auth/account.service';
import { TaskService } from 'app/entities/task/service/task.service';
import { TaskGroupService } from 'app/entities/task/service/task-group.service';
import { ITask, ITaskGroup, ITaskStats } from 'app/entities/task/task.model';
import { I18nService } from 'app/shared/i18n/i18n.service';
import { TranslatePipe } from 'app/shared/i18n/translate.pipe';

import { Account } from 'app/core/auth/account.model';

import { faPlus, faCalendarAlt, faClipboardList, faLayerGroup, faCalendarCheck, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'jhi-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  imports: [CommonModule, RouterLink, FontAwesomeModule],
})
export default class Home implements OnInit {
  faPlus = faPlus;
  faCalendarAlt = faCalendarAlt;
  faClipboardList = faClipboardList;
  faLayerGroup = faLayerGroup;
  faCalendarCheck = faCalendarCheck;
  faShieldAlt = faShieldAlt;

  account = inject(AccountService).account;
  readonly i18n = inject(I18nService);

  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  private readonly taskGroupService = inject(TaskGroupService);
  private readonly accountService = inject(AccountService);

  stats = signal<ITaskStats>({ total: 0, pending: 0, inProgress: 0, done: 0 });
  recentTasks = signal<ITask[]>([]);
  myGroups = signal<ITaskGroup[]>([]);

  ngOnInit(): void {
    this.accountService.identity().subscribe((acc: Account | null) => {
      if (acc) {
        this.loadDashboardData();
      }
    });
  }

  loadDashboardData(): void {
    this.taskService.getStats().subscribe(stats => this.stats.set(stats));
    this.taskService.getAll().subscribe(tasks => {
      // Sort by last modified and take top 5
      const sorted = [...tasks].sort((a, b) => new Date(b.lastModifiedDate || 0).getTime() - new Date(a.lastModifiedDate || 0).getTime());
      this.recentTasks.set(sorted.slice(0, 5));
    });
    this.taskGroupService.getAll().subscribe(groups => this.myGroups.set(groups));
  }

  login(): void {
    this.router.navigate(['/login']);
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
}
