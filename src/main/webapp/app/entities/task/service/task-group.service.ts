import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ITaskGroup } from '../task.model';
import { ApplicationConfigService } from 'app/core/config/application-config.service';

@Injectable({ providedIn: 'root' })
export class TaskGroupService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);
  private readonly apiUrl = this.applicationConfigService.getEndpointFor('api/task-groups');

  getAll(): Observable<ITaskGroup[]> {
    return this.http.get<ITaskGroup[]>(this.apiUrl);
  }

  getById(id: number): Observable<ITaskGroup> {
    return this.http.get<ITaskGroup>(`${this.apiUrl}/${id}`);
  }

  create(group: ITaskGroup): Observable<ITaskGroup> {
    return this.http.post<ITaskGroup>(this.apiUrl, group);
  }

  update(id: number, group: ITaskGroup): Observable<ITaskGroup> {
    return this.http.put<ITaskGroup>(`${this.apiUrl}/${id}`, group);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addMember(groupId: number, login: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${groupId}/members`, { login });
  }

  removeMember(groupId: number, login: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${groupId}/members/${login}`);
  }

  getMembers(groupId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${groupId}/members`);
  }
}
