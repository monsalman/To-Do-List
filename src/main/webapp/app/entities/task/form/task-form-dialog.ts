import { Component, EventEmitter, Input, Output, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ITask, ITaskGroup } from '../task.model';
import { TaskService } from '../service/task.service';
import { I18nService } from 'app/shared/i18n/i18n.service';
import { TranslatePipe } from 'app/shared/i18n/translate.pipe';

@Component({
  selector: 'app-task-form-dialog',
  templateUrl: './task-form-dialog.html',
  styleUrl: './task-form-dialog.scss',
  imports: [CommonModule, FormsModule, TranslatePipe],
})
export class TaskFormDialog implements OnInit {
  @Input() task: ITask | null = null;
  @Input() groups: ITaskGroup[] = [];
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly taskService = inject(TaskService);
  readonly i18n = inject(I18nService);

  formData = signal<ITask>({
    title: '',
    description: '',
    dueDate: '',
    priority: 'MEDIUM',
    status: 'PENDING',
    isPrivate: true,
    groupId: undefined,
  });

  isEditing = false;
  isSaving = signal(false);

  ngOnInit(): void {
    if (this.task) {
      this.isEditing = true;
      this.formData.set({ ...this.task });
    }
  }

  get isValid(): boolean {
    const data = this.formData();
    return !!data.title && data.title.trim().length > 0;
  }

  updateField(field: keyof ITask, value: any): void {
    this.formData.update(current => ({ ...current, [field]: value }));
  }

  onGroupChange(groupId: string): void {
    if (groupId === '') {
      this.formData.update(current => ({ ...current, groupId: undefined, isPrivate: true }));
    } else {
      this.formData.update(current => ({ ...current, groupId: Number(groupId), isPrivate: false }));
    }
  }

  save(): void {
    if (!this.isValid || this.isSaving()) return;
    this.isSaving.set(true);

    const data = this.formData();

    if (this.isEditing && this.task?.id) {
      this.taskService.update(this.task.id, data).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.saved.emit();
        },
        error: () => this.isSaving.set(false),
      });
    } else {
      this.taskService.create(data).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.saved.emit();
        },
        error: () => this.isSaving.set(false),
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
