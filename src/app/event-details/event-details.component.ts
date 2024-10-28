import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlanService, Event, FreeDay, Weekend } from '../service/plan.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.css']
})
export class EventDetailsComponent implements OnInit {
  eventDetail: Event | FreeDay | Weekend | null = null;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private planService: PlanService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const type = this.route.snapshot.paramMap.get('type'); // np. "event", "freeDay" lub "weekend"

    if (type === 'event') {
      this.planService.getEventById(id).subscribe({
        next: (data) => this.eventDetail = data,
        error: (err) => this.errorMessage = 'Wystąpił błąd podczas ładowania szczegółów wydarzenia.'
      });
    } else if (type === 'freeDay') {
      this.planService.getFreeDayById(id).subscribe({
        next: (data) => this.eventDetail = data,
        error: (err) => this.errorMessage = 'Wystąpił błąd podczas ładowania szczegółów dnia wolnego.'
      });
    } else if (type === 'weekend') {
      this.planService.getWeekendById(id).subscribe({
        next: (data) => this.eventDetail = data,
        error: (err) => this.errorMessage = 'Wystąpił błąd podczas ładowania szczegółów weekendu.'
      });
    }
  }

  isEvent(detail: Event | FreeDay | Weekend): detail is Event {
    return (detail as Event).start_time !== undefined && (detail as Event).end_time !== undefined;
  }

  isFreeDay(detail: Event | FreeDay | Weekend): detail is FreeDay {
    return (detail as FreeDay).reason !== undefined;
  }

  isWeekend(detail: Event | FreeDay | Weekend): detail is Weekend {
    return (detail as Weekend).shift_name !== undefined && (detail as Weekend).date !== undefined;
  }
}
