import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ITask, ITaskStats } from '../task.model';
import { ApplicationConfigService } from 'app/core/config/application-config.service';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);
  private readonly apiUrl = this.applicationConfigService.getEndpointFor('api/tasks');

  getAll(): Observable<ITask[]> {
    return this.http.get<ITask[]>(this.apiUrl);
  }

  getById(id: number): Observable<ITask> {
    return this.http.get<ITask>(`${this.apiUrl}/${id}`);
  }

  getByDateRange(from: string, to: string): Observable<ITask[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<ITask[]>(`${this.apiUrl}/calendar`, { params });
  }

  getStats(): Observable<ITaskStats> {
    return this.http.get<ITaskStats>(`${this.apiUrl}/stats`);
  }

  create(task: ITask): Observable<ITask> {
    return this.http.post<ITask>(this.apiUrl, task);
  }

  update(id: number, task: ITask): Observable<ITask> {
    return this.http.put<ITask>(`${this.apiUrl}/${id}`, task);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
