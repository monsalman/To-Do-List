export interface ITask {
  id?: number;
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  status?: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  isPrivate?: boolean;
  userId?: string;
  groupId?: number;
  groupName?: string;
  createdDate?: string;
  lastModifiedDate?: string;
}

export interface ITaskGroup {
  id?: number;
  name?: string;
  description?: string;
  color?: string;
  ownerId?: string;
  createdDate?: string;
  members?: string[];
  taskCount?: number;
}

export interface ITaskStats {
  total: number;
  pending: number;
  inProgress: number;
  done: number;
}
