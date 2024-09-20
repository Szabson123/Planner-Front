import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanService, Event, FreeDay, Weekend } from '../service/plan.service';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pl';

@Component({
  selector: 'app-plan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.css']
})
export class PlanComponent implements OnInit {
  public events: Event[] = [];
  public freeDays: FreeDay[] = [];
  public weekends: Weekend[] = [];
  public currentMonth: Dayjs; // Aktualny miesiąc

  constructor(private planService: PlanService) {
    this.currentMonth = dayjs().startOf('month'); // Ustawiamy na bieżący miesiąc
  }

  ngOnInit(): void {
    this.loadAllDataForCurrentMonth();
  }

  // Metoda do ładowania wszystkich danych dla aktualnego miesiąca
  private loadAllDataForCurrentMonth(): void {
    this.loadEventsForCurrentMonth();
    this.loadFreeDaysForCurrentMonth();
    this.loadWeekendsForCurrentMonth();
  }

  private loadEventsForCurrentMonth(): void {
    const currentMonthStr = this.currentMonth.format('YYYY-MM');
    this.planService.getEventsForMonth(currentMonthStr).subscribe({
      next: (data: Event[]) => {
        // Filtrowanie eventów po dacie w bieżącym miesiącu
        this.events = data.filter(event => dayjs(event.date).isSame(this.currentMonth, 'month'));
      },
      error: (error) => {
        console.error('Błąd podczas pobierania wydarzeń:', error);
      }
    });
  }

  private loadFreeDaysForCurrentMonth(): void {
    const currentMonthStr = this.currentMonth.format('YYYY-MM');
    this.planService.getFreeDaysForMonth(currentMonthStr).subscribe({
      next: (data: FreeDay[]) => {
        // Filtrowanie dni wolnych po dacie w bieżącym miesiącu
        this.freeDays = data.filter(freeDay => dayjs(freeDay.date).isSame(this.currentMonth, 'month'));
      },
      error: (error) => {
        console.error('Błąd podczas pobierania dni wolnych:', error);
      }
    });
  }

  private loadWeekendsForCurrentMonth(): void {
    const currentMonthStr = this.currentMonth.format('YYYY-MM');
    this.planService.getWeekendsForMonth(currentMonthStr).subscribe({
      next: (data: Weekend[]) => {
        // Filtrowanie weekendów po dacie w bieżącym miesiącu
        this.weekends = data.filter(weekend => dayjs(weekend.date).isSame(this.currentMonth, 'month'));
      },
      error: (error) => {
        console.error('Błąd podczas pobierania weekendów:', error);
      }
    });
  }

  // Metody do zmiany miesiąca
  public previousMonth(): void {
    this.currentMonth = this.currentMonth.subtract(1, 'month'); // Cofnij o miesiąc
    this.loadAllDataForCurrentMonth(); // Załaduj dane dla nowego miesiąca
  }

  public nextMonth(): void {
    this.currentMonth = this.currentMonth.add(1, 'month'); // Przejdź do kolejnego miesiąca
    this.loadAllDataForCurrentMonth(); // Załaduj dane dla nowego miesiąca
  }

  // Metoda do formatowania nazwy miesiąca (np. "Wrzesień 2024")
  public formatCurrentMonth(): string {
    return this.currentMonth.format('MMMM YYYY'); // Format polski dla miesiąca
  }
}
