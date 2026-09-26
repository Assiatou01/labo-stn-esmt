import { Routes } from '@angular/router';

import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ThesesComponent } from './features/theses/theses.component';
import { DocumentsComponent } from './features/documents/documents.component';
import { EvaluationsComponent } from './features/evaluations/evaluations.component';
import { FinancementsComponent } from './features/financements/financements.component';
import { UsersComponent } from './features/users/users.component';
import { AiAssistantComponent } from './features/ai-assistant/ai-assistant.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  {
    path: 'dashboard',
    component: DashboardComponent
  },

  {
    path: 'dashboard/doctorant',
    component: DashboardComponent
  },

  {
    path: 'dashboard/encadreur',
    component: DashboardComponent
  },

  {
    path: 'dashboard/directeur-recherche',
    component: DashboardComponent
  },

  {
    path: 'dashboard/partenaire',
    component: DashboardComponent
  },

  {
    path: 'dashboard/admin',
    component: DashboardComponent
  },

  {
    path: 'theses',
    component: ThesesComponent
  },

  {
    path: 'documents',
    component: DocumentsComponent
  },

  {
    path: 'evaluations',
    component: EvaluationsComponent
  },

  {
    path: 'financements',
    component: FinancementsComponent
  },

  {
    path: 'ai-assistant',
    component: AiAssistantComponent
  },

  {
    path: 'users',
    component: UsersComponent
  },

  {
    path: '**',
    redirectTo: 'dashboard'
  }
];