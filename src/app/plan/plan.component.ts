import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/pl';
import { PlanService, Event, Shift, FreeDay, Availability } from '../service/plan.service';
import { User } from '../service/users.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FormatTimePipe } from "../pipes/format-time.pipe";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('pl');

@Component({
  selector: 'app-plan',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule, FormsModule, AsyncPipe, FormatTimePipe],
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanComponent implements OnInit {
  public events: Event[] = [];
  public shifts: Shift[] = [];
  public dates: Dayjs[] = [];
  public currentMonth: Dayjs;
  public filteredUsers: User[] = [];
  public selectedShift: string = '';

  private freeDays: FreeDay[] = [];
  private availability: Availability[] =[];
  private users: User[] = [];

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    private readonly _route: ActivatedRoute,
    private planService: PlanService
  ) {
    this.currentMonth = dayjs().tz('Europe/Warsaw').startOf('month');
  }

  ngOnInit() {
    const data = this._route.snapshot.data['planData'];

    this.events = data?.events || [];
    this.shifts = data?.shifts || [];
    this.users = data?.users || [];
    this.filteredUsers = [...this.users];
    this.freeDays = data?.freeDays || [];
    this.availability = data?.availability || [];

    this.generateDatesForCurrentMonth();
    this.applyFilter();
  }

  public restorePlanner(): void {
    this.planService.restorePlanner().subscribe({
      next: (res) => {
        console.log('Planner restored successfully', res);
        this.refreshEvents();
      },
      error: (e) => {
        console.error('Error restoring planner', e);
      }
    });
  }
  
  capitalize(value: string): string {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  public previousMonth(): void {
    this.updateCurrentMonth(this.currentMonth.subtract(1, 'month'));
  }

  public nextMonth(): void {
    this.updateCurrentMonth(this.currentMonth.add(1, 'month'));
  }

  // public getEventsForDate(date: Dayjs): Event[] {
  //   return this.events.filter(event => dayjs(event.date).isSame(date, 'day'));
  // }
  //
  // public getFreeDayForDate(date: Dayjs): FreeDay[] {
  //   return this.free_day.filter(free_day => dayjs(free_day.date).isSame(date, 'day'));
  // }

  public getEventsForDateAndUser(date: Dayjs, user: User): Event[] {
    return this.events.filter(event => dayjs(event.date).isSame(date, 'day') && event.user.id === user.id);
  }

  public getFilteredEventsForDateAndUser(date: Dayjs, user: User): Event[] {
    return this.getEventsForDateAndUser(date, user).filter(event =>
      !this.selectedShift || event.shift_name === this.selectedShift
    );
  }

  public hasFreeDay(date: Dayjs, user: User): boolean {
    return this.freeDays.some(day => dayjs(day.date).isSame(date, 'day') && day.user.id === user.id);
  }
  public hasAvailibility(date: Dayjs, user: User): boolean {
    return this.availability.some(day => dayjs(day.date).isSame(date, 'day') && day.user.id === user.id);
  }

  public generatePlanner(): void {
    this.planService.generatePlanner().subscribe({
      next: (res) => {
        console.log('Planner generated successfully', res);
        this.refreshEvents();
      },
      error: (e) => {
        console.error('Error generating planner', e);
      }
    });
  }

  public applyFilter(): void {
    if (!this.selectedShift) {
      this.filteredUsers = [...this.users];
    } else {
      const usersWithSelectedShift = this.events
        .filter(event => event.shift_name === this.selectedShift)
        .map(event => event.user.id);

      this.filteredUsers = this.users.filter(user => usersWithSelectedShift.includes(user.id));
    }

    this.sortUsers();
  }

  private updateCurrentMonth(newMonth: Dayjs): void {
    this.currentMonth = newMonth;
    this.loadEventsForCurrentMonth();
    this.loadFreeDaysForCurrentMonth();
    this.loadAvailabilityDaysForCurrentMonth();
  }

  private refreshEvents(): void {
    this.planService.getEvents().subscribe((data: Event[]) => {
      this.events = data;
      this.generateDatesForCurrentMonth();
      this._cdr.markForCheck();
    });
  }

  private sortUsers(): void {
    this.filteredUsers.sort((a, b) => {
      const shiftA = this.getFirstShiftForUser(a);
      const shiftB = this.getFirstShiftForUser(b);

      return this.compareShifts(shiftA, shiftB);
    });

    this._cdr.markForCheck();
  }

  private compareShifts(shiftA: Shift | null, shiftB: Shift | null): number {
    if (shiftA && shiftB) {
      return shiftA.name.localeCompare(shiftB.name);
    } else if (shiftA) {
      return -1;
    } else if (shiftB) {
      return 1;
    } else {
      return 0;
    }
  }

  private getFirstShiftForUser(user: User): Shift | null {
    const userEvents = this.events.filter(event => event.user.id === user.id);

    if (userEvents.length > 0) {
      const firstEvent = userEvents[0];
      return this.shifts.find(shift => shift.name === firstEvent.shift_name) || null;
    }

    return null;
  }

  private generateDatesForCurrentMonth(): void {
    const startOfMonth = this.currentMonth.clone().startOf('month');
    const endOfMonth = this.currentMonth.clone().endOf('month');
    const dates: Dayjs[] = [];

    let currentDate = startOfMonth;

    while (currentDate.isBefore(endOfMonth) || currentDate.isSame(endOfMonth, 'day')) {
      dates.push(currentDate);
      currentDate = currentDate.add(1, 'day');
    }

    this.dates = dates;
    this._cdr.markForCheck();
  }


  private loadEventsForCurrentMonth(): void {
    this.planService.getEventsForMonth(this.currentMonth.format('YYYY-MM')).subscribe(data => {
      this.events = data;
      this.generateDatesForCurrentMonth();
      this.applyFilter();

      this._cdr.markForCheck();
    });
  }

  private loadFreeDaysForCurrentMonth(): void {
    this.planService.getFreeDaysForMonth(this.currentMonth.format('YYYY-MM')).subscribe(data => {
      this.freeDays = data;

      this._cdr.markForCheck();
    });
  }

  private loadAvailabilityDaysForCurrentMonth(): void {
    this.planService.getAvailabilityForMonth(this.currentMonth.format('YYYY-MM')).subscribe(data => {
      this.availability = data;

      this._cdr.markForCheck();
    });
  }
}
