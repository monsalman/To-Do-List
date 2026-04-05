import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ITaskGroup } from '../task.model';
import { TaskGroupService } from '../service/task-group.service';
import { I18nService } from 'app/shared/i18n/i18n.service';
import { TranslatePipe } from 'app/shared/i18n/translate.pipe';

@Component({
  selector: 'app-task-group-manager',
  templateUrl: './task-group-manager.html',
  styleUrl: './task-group-manager.scss',
  imports: [CommonModule, FormsModule, TranslatePipe],
})
export default class TaskGroupManager implements OnInit {
  private readonly taskGroupService = inject(TaskGroupService);
  readonly i18n = inject(I18nService);

  groups = signal<ITaskGroup[]>([]);
  showForm = signal(false);
  editingGroup = signal<ITaskGroup | null>(null);
  selectedGroup = signal<ITaskGroup | null>(null);

  newGroupName = '';
  newGroupDesc = '';
  newGroupColor = '#6C5CE7';
  newMemberLogin = '';

  readonly colors = ['#6C5CE7', '#00B894', '#E17055', '#74B9FF', '#FDCB6E', '#A29BFE', '#55EFC4', '#FF7675', '#FD79A8'];

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.taskGroupService.getAll().subscribe(groups => this.groups.set(groups));
  }

  openCreateForm(): void {
    this.editingGroup.set(null);
    this.newGroupName = '';
    this.newGroupDesc = '';
    this.newGroupColor = '#6C5CE7';
    this.showForm.set(true);
  }

  openEditForm(group: ITaskGroup): void {
    this.editingGroup.set(group);
    this.newGroupName = group.name || '';
    this.newGroupDesc = group.description || '';
    this.newGroupColor = group.color || '#6C5CE7';
    this.showForm.set(true);
  }

  saveGroup(): void {
    if (!this.newGroupName.trim()) return;

    const data: ITaskGroup = {
      name: this.newGroupName,
      description: this.newGroupDesc,
      color: this.newGroupColor,
    };

    if (this.editingGroup()) {
      this.taskGroupService.update(this.editingGroup()!.id!, data).subscribe(() => {
        this.showForm.set(false);
        this.loadGroups();
      });
    } else {
      this.taskGroupService.create(data).subscribe(() => {
        this.showForm.set(false);
        this.loadGroups();
      });
    }
  }

  deleteGroup(group: ITaskGroup): void {
    if (confirm(this.i18n.t('group.deleteConfirm'))) {
      this.taskGroupService.delete(group.id!).subscribe(() => {
        if (this.selectedGroup()?.id === group.id) {
          this.selectedGroup.set(null);
        }
        this.loadGroups();
      });
    }
  }

  selectGroup(group: ITaskGroup): void {
    this.selectedGroup.set(group);
  }

  addMember(): void {
    const group = this.selectedGroup();
    if (!group || !this.newMemberLogin.trim()) return;

    this.taskGroupService.addMember(group.id!, this.newMemberLogin.trim()).subscribe({
      next: () => {
        this.newMemberLogin = '';
        this.loadGroups();
        // Refresh selected group
        this.taskGroupService.getById(group.id!).subscribe(g => this.selectedGroup.set(g));
      },
      error: () => {
        // Handle error
      },
    });
  }

  removeMember(login: string): void {
    const group = this.selectedGroup();
    if (!group) return;

    this.taskGroupService.removeMember(group.id!, login).subscribe(() => {
      this.loadGroups();
      this.taskGroupService.getById(group.id!).subscribe(g => this.selectedGroup.set(g));
    });
  }

  cancelForm(): void {
    this.showForm.set(false);
  }
}
