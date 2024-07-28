import { Routes } from '@angular/router';
import { PlanComponent } from './plan/plan.component';

export const routes: Routes = [
  { path: 'plan', component: PlanComponent },
  { path: '', redirectTo: '/plan', pathMatch: 'full' },
  { path: '**', redirectTo: '/plan' } 
];
