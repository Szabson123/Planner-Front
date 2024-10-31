import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanService, Event, FreeDay, Weekend } from '../service/plan.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

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
  overtime: number = 0; 
  overtimeMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private planService: PlanService,
    private router: Router 
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const type = this.route.snapshot.paramMap.get('type'); 

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
  onChangeEventToFreeDay(): void {
    if (this.eventDetail) {
      const reason = prompt('Podaj powód zmiany na dzień wolny:', 'Brak powodu');
      if (reason === null) {
        return;
      }
      
      this.planService.changeEventToFreeDay(this.eventDetail.id, reason).subscribe(
        (response: any) => {
          this.router.navigate(['/plan']);
        },
        (error: HttpErrorResponse) => {
          this.errorMessage = error.error.error || 'Nie udało się zmienić wydarzenia na dzień wolny.';
        }
      );
    }
  }
  onChangeWeekendToEvent(): void {
    const start_time = prompt('Podaj czas rozpoczęcia:', '08:00');
    const end_time = prompt('Podaj czas zakończenia:', '16:00');
    
    if (start_time && end_time && this.eventDetail) {
        this.planService.changeWeekendToEvent(this.eventDetail.id, start_time, end_time).subscribe({
            next: () => {
                this.router.navigate(['/plan']);
            },
            error: (error: HttpErrorResponse) => {
                this.errorMessage = error.error.error || 'Nie udało się zmienić weekendu na dzień pracujący.';
            }
        });
    } else {
        this.errorMessage = 'Proszę podać zarówno czas rozpoczęcia, jak i zakończenia.';
    }
}

  isEvent(detail: Event | FreeDay | Weekend): detail is Event {
    return 'start_time' in detail && 'end_time' in detail;
  }
  
  isFreeDay(detail: Event | FreeDay | Weekend): detail is FreeDay {
    return 'reason' in detail;
  }
  
  isWeekend(detail: Event | FreeDay | Weekend): detail is Weekend {
    return 'shift_name' in detail && !this.isEvent(detail) && !this.isFreeDay(detail);
  }
}
