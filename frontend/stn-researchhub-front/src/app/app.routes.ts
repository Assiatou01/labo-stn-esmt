import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ThesesComponent } from './features/theses/theses.component';
import { DocumentsComponent } from './features/documents/documents.component';
import { EvaluationsComponent } from './features/evaluations/evaluations.component';
import { FinancementsComponent } from './features/financements/financements.component';
import { UsersComponent } from './features/users/users.component';
import { AiRagComponent } from './features/ai-rag/ai-rag.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'theses', component: ThesesComponent },
  { path: 'documents', component: DocumentsComponent },
  { path: 'evaluations', component: EvaluationsComponent },
  { path: 'financements', component: FinancementsComponent },
  { path: 'ai-rag', component: AiRagComponent },
  { path: 'users', component: UsersComponent },
  { path: '**', redirectTo: 'dashboard' }
];
