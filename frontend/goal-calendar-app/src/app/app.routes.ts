import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'calendar', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'calendar',
    loadComponent: () => import('./calendar/calendar.component').then(m => m.CalendarComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'calendar' }
];
