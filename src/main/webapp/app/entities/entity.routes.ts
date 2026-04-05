import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'authority',
    data: { pageTitle: 'Authorities' },
    loadChildren: () => import('./admin/authority/authority.routes'),
  },
  {
    path: 'user-management',
    data: { pageTitle: 'UserManagements' },
    loadChildren: () => import('./admin/user-management/user-management.routes'),
  },
  {
    path: 'tasks',
    data: { pageTitle: 'Tasks' },
    loadChildren: () => import('./task/task.routes'),
  },
  {
    path: 'groups',
    data: { pageTitle: 'Groups' },
    loadComponent: () => import('./task/group/task-group-manager'),
  },
  {
    path: 'calendar',
    data: { pageTitle: 'Calendar' },
    loadComponent: () => import('./task/calendar/task-calendar'),
  },
  /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
];

export default routes;
