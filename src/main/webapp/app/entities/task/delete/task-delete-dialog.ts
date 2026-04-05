import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ITask } from '../task.model';
import { TaskService } from '../service/task.service';
import { I18nService } from 'app/shared/i18n/i18n.service';
import { TranslatePipe } from 'app/shared/i18n/translate.pipe';

@Component({
  selector: 'app-task-delete-dialog',
  template: `
    <div class="td-modal-overlay" (click)="onOverlayClick($event)">
      <div class="td-modal" style="max-width: 420px;">
        <div class="td-modal-header">
          <h2>{{ 'task.deleteTask' | translate }}</h2>
          <button class="td-btn td-btn-ghost td-btn-icon" (click)="cancel()">✕</button>
        </div>
        <div class="delete-body">
          <div class="delete-icon">⚠️</div>
          <p class="delete-title">{{ task?.title }}</p>
          <p class="delete-message">{{ 'task.deleteConfirm' | translate }}</p>
          <p class="delete-warning">{{ 'task.deleteWarning' | translate }}</p>
        </div>
        <div class="td-modal-actions">
          <button class="td-btn td-btn-secondary" (click)="cancel()" id="delete-cancel-btn">
            {{ 'task.cancel' | translate }}
          </button>
          <button class="td-btn td-btn-danger" (click)="confirm()" id="delete-confirm-btn">
            {{ 'task.delete' | translate }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .delete-body {
        text-align: center;
        padding: 1rem 0;
      }
      .delete-icon {
        font-size: 3rem;
        margin-bottom: 0.75rem;
      }
      .delete-title {
        font-weight: 600;
        font-size: 1.1rem;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
      }
      .delete-message {
        color: var(--text-secondary);
        margin-bottom: 0.25rem;
      }
      .delete-warning {
        color: var(--color-danger);
        font-size: 0.85rem;
        font-weight: 500;
      }
    `,
  ],
  imports: [CommonModule, TranslatePipe],
})
export class TaskDeleteDialog {
  @Input() task: ITask | null = null;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly taskService = inject(TaskService);
  readonly i18n = inject(I18nService);

  confirm(): void {
    if (this.task?.id) {
      this.taskService.delete(this.task.id).subscribe(() => {
        this.confirmed.emit();
      });
    }
  }

  cancel(): void {
    this.cancelled.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('td-modal-overlay')) {
      this.cancel();
    }
  }
}
