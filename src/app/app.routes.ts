import { Routes } from '@angular/router';
import { PlanComponent } from './plan/plan.component';
import { planResolver } from "./plan/plan.resolver";

export const routes: Routes = [
  {
    path: 'plan',
    component: PlanComponent,
    resolve: {
      planData: planResolver
    }
  },
  {
    path: '',
    redirectTo: '/plan',
    pathMatch: 'full'
  },
  { path: '**', redirectTo: '/plan' }
];
