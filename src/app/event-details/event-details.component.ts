import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlanService, Event, FreeDay, Weekend } from '../service/plan.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.css']
})
export class EventDetailsComponent implements OnInit {
  eventDetail: Event | FreeDay | Weekend | null = null;
  errorMessage: string | null = null;
  overtime: number = 0; // Zmienna do przechowywania wprowadzonej wartości nadgodzin
  overtimeMessage: string | null = null; // Wiadomość potwierdzenia lub błędu

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

  // Funkcja do dodawania nadgodzin
  onAddOvertime(): void {
    if (!this.eventDetail || !this.isEvent(this.eventDetail)) {
      this.overtimeMessage = "Nie można dodać nadgodzin. Nieprawidłowe ID wydarzenia.";
      return;
    }

    this.planService.addOvertime(this.eventDetail.id, this.overtime).subscribe({
      next: () => {
        this.overtimeMessage = "Nadgodziny dodane pomyślnie.";
        if (this.eventDetail && this.isEvent(this.eventDetail)) {
          this.eventDetail.overtime = this.overtime;
        }
      },
      error: () => {
        this.overtimeMessage = "Wystąpił błąd podczas dodawania nadgodzin.";
      }
    });
  }

  // Type guard dla event
  isEvent(detail: Event | FreeDay | Weekend): detail is Event {
    return (detail as Event).start_time !== undefined && (detail as Event).end_time !== undefined;
  }

  // Type guard dla freeDay
  isFreeDay(detail: Event | FreeDay | Weekend): detail is FreeDay {
    return (detail as FreeDay).reason !== undefined;
  }

  // Type guard dla weekend
  isWeekend(detail: Event | FreeDay | Weekend): detail is Weekend {
    return (detail as Weekend).shift_name !== undefined && (detail as Weekend).date !== undefined;
  }
}
