import { Component, OnInit } from '@angular/core';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/pl';
import { PlanService, Event, Shift, FreeDay } from '../service/plan.service';
import { UsersService, User } from '../service/users.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';


dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('pl');

@Component({
  selector: 'app-plan',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.css'],
  providers: [PlanService, UsersService]
})
export class PlanComponent implements OnInit {
  events: Event[] = [];
  shifts: Shift[] = [];
  dates: Dayjs[] = [];
  free_day: FreeDay[] = [];
  currentMonth: Dayjs;
  users: User[] = [];

  constructor(private planService: PlanService, private usersService: UsersService) {
    this.currentMonth = dayjs().tz('Europe/Warsaw').startOf('month');
  }

  ngOnInit() {
    this.planService.getEvents().subscribe((data: Event[]) => {
      this.events = data;
      this.generateDatesForCurrentMonth();
    });
    this.planService.getShifts().subscribe((data: Shift[]) => {
      this.shifts = data;
    });
    this.usersService.getUsers().subscribe((data: User[]) => {
      this.users = data;
    });
    this.planService.getFreeDays().subscribe((data: FreeDay[]) => {
      this.free_day = data;
    });
  }

  generateDatesForCurrentMonth() {
    const startOfMonth = this.currentMonth.clone().startOf('month');
    const endOfMonth = this.currentMonth.clone().endOf('month');
    const dates: Dayjs[] = [];

    let currentDate = startOfMonth;

    while (currentDate.isBefore(endOfMonth) || currentDate.isSame(endOfMonth, 'day')) {
      dates.push(currentDate);
      currentDate = currentDate.add(1, 'day');
    }

    this.dates = dates;
  }

  getEventsForDate(date: Dayjs): Event[] {
    return this.events.filter(event => dayjs(event.date).isSame(date, 'day'));
  }
  getFreeDayForDate(date: Dayjs): FreeDay[] {
    return this.free_day.filter(free_day => dayjs(free_day.date).isSame(date, 'day'));
  }

  getEventsForDateAndUser(date: Dayjs, user: User): Event[] {
    return this.events.filter(event => dayjs(event.date).isSame(date, 'day') && event.user.id === user.id);
  }
  
  hasFreeDay(date: Dayjs, user: User): boolean {
    return this.free_day.some(free_day => dayjs(free_day.date).isSame(date, 'day') && free_day.user.id === user.id);
  }

  previousMonth() {
    this.currentMonth = this.currentMonth.subtract(1, 'month');
    this.generateDatesForCurrentMonth();
  }

  nextMonth() {
    this.currentMonth = this.currentMonth.add(1, 'month');
    this.generateDatesForCurrentMonth();
  }

  formatTime(time: string): string {
    return time.slice(0, -3);
  }

  generatePlanner() {
    this.planService.generatePlanner().subscribe(
      response => {
        console.log('Planner generated successfully', response);
        this.refreshEvents();
      },
      error => {
        console.error('Error generating planner', error);
      }
    );
  }

  refreshEvents() {
    this.planService.getEvents().subscribe((data: Event[]) => {
      this.events = data;
      this.generateDatesForCurrentMonth();
    });
  }
}

