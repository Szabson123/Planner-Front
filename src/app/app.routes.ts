import { Routes } from '@angular/router';
import { PlanComponent } from './plan/plan.component';
import { planResolver } from "./plan/plan.resolver";
import { AvailabilityComponent } from './availability/availability.component';
import { FreeDaysComponent } from './free-days/free-days.component';
import { ShiftsComponent } from './shifts/shifts.component';
import { LoginComponent } from './auth/login/login.component';
import { LogoutComponent } from './auth/logout/logout.component';
import { RegisterComponent } from './auth/register/register.component';
import { AddHolyDayComponent } from './addholyday/addholyday.component';
import { MachineAddComponent } from './machines/machine-add/machine-add.component';
import { MachineDetailComponent } from './machines/machine-detail/machine-detail.component';
import { MachineListComponent } from './machines/machine-list/machine-list.component';
import { ReviewListComponent } from './machines/review-list/review-list.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserReportsComponent } from './user-reports/user-reports.component';
import { AddReportComponent } from './add-report/add-report.component';

export const routes: Routes = [
  {
    path: 'plan',
    component: PlanComponent,
    resolve: {
      planData: planResolver
    }
  },
  { path: 'machines', component: MachineListComponent },
  { path: 'machines/add', component: MachineAddComponent },
  { path: 'machines/:id', component: MachineDetailComponent },

  { path: 'review', component: ReviewListComponent },

  {
    path: 'availability',
    component: AvailabilityComponent
  },

  { 
    path: 'free_days', 
    component: FreeDaysComponent
  },

  { path: 'workers', component: UserListComponent},
  { path: 'users/:userId/reports', component: UserReportsComponent },
  { path: 'add-report', component: AddReportComponent },

  { 
    path: 'shifts', 
    component: ShiftsComponent
  },
  { path: 'add-holyday',
   component: AddHolyDayComponent },
  
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'logout', component: LogoutComponent },

  { 
    path: 'details/:type/:id', 
    loadComponent: () => import('./event-details/event-details.component').then(m => m.EventDetailsComponent) 
  },

  { path: '', redirectTo: '/plan', pathMatch: 'full' },
  { path: '**', redirectTo: '/plan' }
];
