import { Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/task-list'),
    data: { pageTitle: 'Tasks' },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'calendar',
    loadComponent: () => import('./calendar/task-calendar'),
    data: { pageTitle: 'Calendar' },
    canActivate: [UserRouteAccessService],
  },
];

export default routes;
