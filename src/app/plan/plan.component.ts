import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { PlanService, Event } from '../service/plan.service';

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

  constructor(private planService: PlanService) {}

  ngOnInit() {
    this.planService.getEvents().subscribe((data: Event[]) => {
      this.events = data;
    });
  }
}
