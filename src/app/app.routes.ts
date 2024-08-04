import { Routes } from '@angular/router';
import { PlanComponent } from './plan/plan.component';
import { planResolver } from "./plan/plan.resolver";
import { AvailabilityComponent } from './availability/availability.component';
import { FreeDaysComponent } from './free-days/free-days.component';
import { ShiftsComponent } from './shifts/shifts.component';
import { LoginComponent } from './auth/login/login.component';
import { LogoutComponent } from './auth/logout/logout.component';
import { RegisterComponent } from './auth/register/register.component';

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

  { path: 'shifts', 
    component: ShiftsComponent
  },
  
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'logout', component: LogoutComponent },

  { path: '', redirectTo: '/plan', pathMatch: 'full' },
  { path: '**', redirectTo: '/plan' }
];
