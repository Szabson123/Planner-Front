import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { PlanService, Event, Shift, FreeDay } from '../service/plan.service';
import { UsersService, User } from '../service/users.service';

export const planResolver: ResolveFn<{ events: Event[], shifts: Shift[], users: User[], freeDays: FreeDay[] }> = () => {
  const planService = inject(PlanService);
  const usersService = inject(UsersService);

  return forkJoin({
    events: planService.getEvents(),
    shifts: planService.getShifts(),
    users: usersService.getUsers(),
    freeDays: planService.getFreeDays()
  });
};
