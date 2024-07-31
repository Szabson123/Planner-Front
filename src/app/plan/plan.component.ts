import { Component, OnInit } from '@angular/core';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/pl';
import { PlanService, Event } from '../service/plan.service';
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
  dates: Dayjs[] = [];
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
    this.usersService.getUsers().subscribe((data: User[]) => {
      this.users = data;
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

  previousMonth() {
    this.currentMonth = this.currentMonth.subtract(1, 'month');
    this.generateDatesForCurrentMonth();
  }

  nextMonth() {
    this.currentMonth = this.currentMonth.add(1, 'month');
    this.generateDatesForCurrentMonth();
  }
}
