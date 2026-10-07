import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'cartographie',
    loadComponent: () => import('./features/cartographie/cartographie.component').then(m => m.CartographieComponent),
    canActivate: [authGuard]
  },
  {
    path: 'axes-domaines',
    loadComponent: () => import('./features/axes-domaines/axes-domaines.component').then(m => m.AxesDomainesComponent),
    canActivate: [roleGuard('ADMIN', 'DIRECTEUR_RECHERCHE')]
  },
  {
    path: 'theses',
    loadComponent: () => import('./features/theses/theses-list.component').then(m => m.ThesesListComponent),
    canActivate: [roleGuard('ADMIN', 'DIRECTEUR_RECHERCHE', 'ENCADREUR', 'DOCTORANT', 'PARTENAIRE')]
  },
  {
    path: 'livrables',
    loadComponent: () => import('./features/livrables/livrables-list.component').then(m => m.LivrablesListComponent),
    canActivate: [roleGuard('ADMIN', 'DIRECTEUR_RECHERCHE', 'ENCADREUR', 'DOCTORANT')]
  },
  {
    path: 'livrables/depot',
    loadComponent: () => import('./features/livrables/livrables-list.component').then(m => m.LivrablesListComponent),
    canActivate: [roleGuard('ADMIN', 'DIRECTEUR_RECHERCHE', 'ENCADREUR', 'DOCTORANT')]
  },
  {
    path: 'trl-evaluation',
    loadComponent: () => import('./features/trl-evaluation/trl-evaluation.component').then(m => m.TrlEvaluationComponent),
    canActivate: [roleGuard('ADMIN', 'DIRECTEUR_RECHERCHE', 'ENCADREUR', 'DOCTORANT', 'PARTENAIRE')]
  },
  {
    path: 'ia-assistant',
    loadComponent: () => import('./features/ia-assistant/ia-assistant.component').then(m => m.IaAssistantComponent),
    canActivate: [roleGuard('ADMIN', 'DIRECTEUR_RECHERCHE', 'ENCADREUR', 'DOCTORANT')]
  },
  {
    path: 'financements',
    loadComponent: () => import('./features/financements/financements-list.component').then(m => m.FinancementsListComponent),
    canActivate: [roleGuard('ADMIN', 'DIRECTEUR_RECHERCHE', 'ENCADREUR', 'DOCTORANT', 'PARTENAIRE')]
  },
  {
    path: 'users',
    loadComponent: () => import('./features/users/users-list.component').then(m => m.UsersListComponent),
    canActivate: [roleGuard('ADMIN', 'DIRECTEUR_RECHERCHE')]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
