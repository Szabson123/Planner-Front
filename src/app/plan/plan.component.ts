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
  public currentMonth: Dayjs;
  public isLoading = true; // Zmienna, która kontroluje stan ładowania

  // Cache dla danych
  private cache: { [month: string]: { events: Event[], freeDays: FreeDay[], weekends: Weekend[] } } = {};

  constructor(private planService: PlanService) {
    this.currentMonth = dayjs().startOf('month'); // Bieżący miesiąc
  }

  ngOnInit(): void {
    this.loadAllDataForCurrentMonth();
    this.preloadAdjacentMonths(); // Pre-load danych dla poprzedniego i następnego miesiąca
  }

  private loadAllDataForCurrentMonth(): void {
    this.isLoading = true; // Zaczynamy ładowanie
    const currentMonthStr = this.currentMonth.format('YYYY-MM');

    if (this.cache[currentMonthStr]) {
      this.loadFromCache(currentMonthStr);
      this.isLoading = false; // Ładowanie zakończone
    } else {
      this.loadDataForMonth(currentMonthStr);
    }
  }

  private preloadAdjacentMonths(): void {
    const previousMonth = this.currentMonth.subtract(1, 'month').format('YYYY-MM');
    const nextMonth = this.currentMonth.add(1, 'month').format('YYYY-MM');

    if (!this.cache[previousMonth]) {
      this.loadDataForMonth(previousMonth);
    }
    if (!this.cache[nextMonth]) {
      this.loadDataForMonth(nextMonth);
    }
  }

  private loadDataForMonth(month: string): void {
    let events: Event[] = [];
    let freeDays: FreeDay[] = [];
    let weekends: Weekend[] = [];

    this.planService.getEventsForMonth(month).subscribe({
      next: (data: Event[]) => {
        events = data.filter(event => dayjs(event.date).isSame(month, 'month'));
        this.cache[month] = { events, freeDays, weekends };
        this.checkIfAllDataLoaded(); // Sprawdzamy, czy załadowano wszystkie dane
      },
      error: (error) => {
        console.error('Błąd podczas pobierania wydarzeń:', error);
      }
    });

    this.planService.getFreeDaysForMonth(month).subscribe({
      next: (data: FreeDay[]) => {
        freeDays = data.filter(freeDay => dayjs(freeDay.date).isSame(month, 'month'));
        this.cache[month] = { ...this.cache[month], freeDays };
        this.checkIfAllDataLoaded(); // Sprawdzamy, czy załadowano wszystkie dane
      },
      error: (error) => {
        console.error('Błąd podczas pobierania dni wolnych:', error);
      }
    });

    this.planService.getWeekendsForMonth(month).subscribe({
      next: (data: Weekend[]) => {
        weekends = data.filter(weekend => dayjs(weekend.date).isSame(month, 'month'));
        this.cache[month] = { ...this.cache[month], weekends };
        this.checkIfAllDataLoaded(); // Sprawdzamy, czy załadowano wszystkie dane
      },
      error: (error) => {
        console.error('Błąd podczas pobierania weekendów:', error);
      }
    });
  }

  private loadFromCache(month: string): void {
    const cachedData = this.cache[month];
    this.events = cachedData.events;
    this.freeDays = cachedData.freeDays;
    this.weekends = cachedData.weekends;
  }

  // Sprawdzamy, czy załadowano wszystkie dane
  private checkIfAllDataLoaded(): void {
    const currentMonthStr = this.currentMonth.format('YYYY-MM');
    const cachedData = this.cache[currentMonthStr];
    if (cachedData.events && cachedData.freeDays && cachedData.weekends) {
      this.events = cachedData.events;
      this.freeDays = cachedData.freeDays;
      this.weekends = cachedData.weekends;
      this.isLoading = false; // Zakończono ładowanie
    }
  }

  public previousMonth(): void {
    this.currentMonth = this.currentMonth.subtract(1, 'month'); // Cofnij o miesiąc
    this.loadAllDataForCurrentMonth();
    this.preloadAdjacentMonths();
  }

  public nextMonth(): void {
    this.currentMonth = this.currentMonth.add(1, 'month'); // Przejdź do kolejnego miesiąca
    this.loadAllDataForCurrentMonth();
    this.preloadAdjacentMonths();
  }

  public formatCurrentMonth(): string {
    return this.currentMonth.format('MMMM YYYY');
  }
}
