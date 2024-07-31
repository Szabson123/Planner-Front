import { Component, OnInit } from '@angular/core';
import dayjs, { Dayjs } from 'dayjs';
import { PlanService, Event } from '../service/plan.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-plan',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.css'],
  providers: [PlanService]
})
export class PlanComponent implements OnInit {
  events: Event[] = [];
  dates: Dayjs[] = [];

  constructor(private planService: PlanService) {}

  ngOnInit() {
    this.planService.getEvents().subscribe((data: Event[]) => {
      this.events = data;
    });
    this.generateDatesForCurrentMonth();
  }

  generateDatesForCurrentMonth() {
    const startOfMonth = dayjs().startOf('month');
    const endOfMonth = dayjs().endOf('month');
    const dates: Dayjs[] = [];

    let currentDate = startOfMonth;

    while (currentDate.isBefore(endOfMonth) || currentDate.isSame(endOfMonth, 'day')) {
      dates.push(currentDate);
      currentDate = currentDate.add(1, 'day');
    }

    this.dates = dates;
  }
}
