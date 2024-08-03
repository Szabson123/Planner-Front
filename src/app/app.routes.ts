import { Routes } from '@angular/router';
import { PlanComponent } from './plan/plan.component';
import { planResolver } from "./plan/plan.resolver";
import { AvailabilityComponent } from './availability/availability.component';
import { FreeDaysComponent } from './free-days/free-days.component';

export const routes: Routes = [
  {
    path: 'plan',
    component: PlanComponent,
    resolve: {
      planData: planResolver
    }
  },

  {
    path: 'avaibility',
    component: AvailabilityComponent
  },

  { path: 'free_days', 
    component: FreeDaysComponent
  },

  { path: '', redirectTo: '/plan', pathMatch: 'full' },
  { path: '**', redirectTo: '/plan' }
];
