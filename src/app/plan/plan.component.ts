// plan.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanService, Event, FreeDay, Weekend } from '../service/plan.service';
import { UsersService, User } from '../service/users.service';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pl';
import { BehaviorSubject, Subscription, EMPTY, Observable, of, forkJoin } from 'rxjs';
import { switchMap, distinctUntilChanged, catchError, tap, debounceTime, finalize, shareReplay, retry, map } from 'rxjs/operators';
import { TruncatePipe } from '../truncate.pipe';

export interface EventData {
  type: 'event' | 'freeDay' | 'weekend';
  details: any; // Możesz sprecyzować typ dla każdego rodzaju danych
}

@Component({
  selector: 'app-plan',
  standalone: true,
  imports: [CommonModule, TruncatePipe],
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.css']
})
export class PlanComponent implements OnInit, OnDestroy {
  public events: Event[] = [];
  public freeDays: FreeDay[] = [];
  public weekends: Weekend[] = [];
  public currentMonth: Dayjs;
  public isLoading = true;
  public errorMessage: string | null = null; 

  // Zmienne dla użytkowników
  public users: User[] = [];
  public isUsersLoading = true;
  public usersErrorMessage: string | null = null;

  // Zmienna dla dni miesiąca
  public daysInMonth: Dayjs[] = [];

  // Struktura danych dla harmonogramu
  public schedule: Map<number, Map<string, EventData[]>> = new Map();

  // Mapa kolorów przypisanych do zmian
  private shiftColors: string[] = [
    '#FFCDD2', // Light Red
    '#C8E6C9', // Light Green
    '#B3E5FC', // Light Blue
    '#FFF9C4', // Light Yellow
    '#D1C4E9', // Light Purple
    '#FFECB3', // Light Amber
    '#B2DFDB', // Light Teal
    '#F8BBD0', // Light Pink
    '#DCEDC8', // Light Lime
    '#D7CCC8'  // Light Brown
  ];

  // Mapa do przypisywania kolorów do nazw zmian
  public shiftColorMap: Map<string, string> = new Map();

  // Mapa do przechowywania głównej zmiany użytkownika
  public primaryShiftMap: Map<number, string> = new Map();

  private cache: Map<string, { events: Event[], freeDays: FreeDay[], weekends: Weekend[] }> = new Map();
  private readonly CACHE_LIMIT = 12; 

  private inProgressRequests: Map<string, Observable<void>> = new Map();

  private navigationSubject = new BehaviorSubject<Dayjs>(dayjs().startOf('month'));
  
  private navigationSubscription!: Subscription;
  private dataFetchSubscription!: Subscription;
  private usersSubscription!: Subscription;
  private isInitialLoad = true;

  constructor(private planService: PlanService, private usersService: UsersService) {
    this.currentMonth = this.navigationSubject.value;
  }

  ngOnInit(): void {
    // Subskrypcja nawigacji miesięcznej
    this.navigationSubscription = this.navigationSubject.pipe(
      distinctUntilChanged((prev, curr) => prev.isSame(curr, 'month'))
    ).subscribe(newMonth => {
      this.currentMonth = newMonth;
      this.clearCurrentMonthData();
      this.generateDaysInMonth(newMonth); // Generowanie dni miesiąca

      const monthStr = this.currentMonth.format('YYYY-MM');

      if (this.cache.has(monthStr)) {
        this.loadFromCache(monthStr);
        this.isLoading = false;

        if (this.isInitialLoad) {
          this.isInitialLoad = false;
          this.preloadAdjacentMonths(newMonth).subscribe();
        }
      } else {
        this.isLoading = true;
      }
    });

    // Subskrypcja na pobieranie danych planu
    this.dataFetchSubscription = this.navigationSubject.pipe(
      debounceTime(300), 
      distinctUntilChanged((prev, curr) => prev.isSame(curr, 'month')),
      switchMap(newMonth => {
        const monthStr = newMonth.format('YYYY-MM');

        if (this.cache.has(monthStr)) {
          return EMPTY;
        } else {
          return this.loadDataForMonthObservable(monthStr, true).pipe(
            tap(() => {
              if (this.isInitialLoad) {
                this.isInitialLoad = false;
                this.preloadAdjacentMonths(newMonth).subscribe();
              }
              // Po załadowaniu danych, generujemy harmonogram
              this.generateSchedule();
            })
          );
        }
      }),
      catchError(error => {
        console.error('Błąd w subskrypcji danych:', error);
        this.errorMessage = 'Wystąpił problem z załadowaniem danych.';
        this.isLoading = false;
        return EMPTY;
      })
    ).subscribe();

    // Subskrypcja na pobieranie użytkowników
    this.usersSubscription = this.usersService.getUsers().pipe(
      retry(2),
      catchError(error => {
        console.error('Błąd podczas pobierania użytkowników:', error);
        this.usersErrorMessage = 'Wystąpił problem z załadowaniem użytkowników.';
        this.isUsersLoading = false;
        return EMPTY;
      })
    ).subscribe((users: User[]) => {
      this.users = users;
      this.isUsersLoading = false;
      // Po załadowaniu użytkowników, generujemy harmonogram
      this.generateSchedule();
    });

    // Generowanie dni dla początkowego miesiąca
    this.generateDaysInMonth(this.currentMonth);
  }

  ngOnDestroy(): void {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
    if (this.dataFetchSubscription) {
      this.dataFetchSubscription.unsubscribe();
    }
    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe();
    }
  }

  private loadDataForMonthObservable(month: string, isCurrentMonth: boolean = false): Observable<void> {
    if (this.inProgressRequests.has(month)) {
      return this.inProgressRequests.get(month)!;
    }

    const load$ = forkJoin({
      events: this.planService.getEventsForMonth(month),
      freeDays: this.planService.getFreeDaysForMonth(month),
      weekends: this.planService.getWeekendsForMonth(month)
    }).pipe(
      retry(2), 
      tap(({ events, freeDays, weekends }) => {
        const monthDayjs = dayjs(month, 'YYYY-MM');

        const filteredEvents = events.filter(event => dayjs(event.date).isSame(monthDayjs, 'month'));
        const filteredFreeDays = freeDays.filter(freeDay => dayjs(freeDay.date).isSame(monthDayjs, 'month'));
        const filteredWeekends = weekends.filter(weekend => dayjs(weekend.date).isSame(monthDayjs, 'month'));

        this.cache.set(month, {
          events: filteredEvents,
          freeDays: filteredFreeDays,
          weekends: filteredWeekends
        });

        if (this.cache.size > this.CACHE_LIMIT) {
          const firstKey = this.cache.keys().next().value!;
          this.cache.delete(firstKey);
        }

        if (isCurrentMonth) {
          this.events = filteredEvents;
          this.freeDays = filteredFreeDays;
          this.weekends = filteredWeekends;
          this.isLoading = false;
        }
      }),
      catchError((error) => {
        console.error(`Błąd podczas pobierania danych dla miesiąca ${month}:`, error);
        if (isCurrentMonth) {
          this.errorMessage = 'Wystąpił problem z załadowaniem danych dla wybranego miesiąca.';
          this.isLoading = false;
        }
        return EMPTY;
      }),
      finalize(() => {
        this.inProgressRequests.delete(month);
      }),
      map(() => void 0),
      shareReplay(1)
    );

    this.inProgressRequests.set(month, load$);

    return load$;
  }

  private preloadAdjacentMonths(newMonth: Dayjs): Observable<void> {
    const previousMonthStr = newMonth.subtract(1, 'month').format('YYYY-MM');
    const nextMonthStr = newMonth.add(1, 'month').format('YYYY-MM');

    const preloadObservables: Observable<void>[] = [];

    if (!this.cache.has(previousMonthStr)) {
      preloadObservables.push(this.loadDataForMonthObservable(previousMonthStr, false));
    }
    if (!this.cache.has(nextMonthStr)) {
      preloadObservables.push(this.loadDataForMonthObservable(nextMonthStr, false));
    }

    if (preloadObservables.length === 0) {
      return of(void 0);
    }

    return forkJoin(preloadObservables).pipe(
      map(() => void 0), 
      catchError((error) => {
        console.error('Błąd podczas preładowywania sąsiadujących miesięcy:', error);
        return EMPTY;
      })
    );
  }

  public previousMonth(): void {
    const newMonth = this.currentMonth.subtract(1, 'month');
    this.navigationSubject.next(newMonth);
  }

  public nextMonth(): void {
    const newMonth = this.currentMonth.add(1, 'month');
    this.navigationSubject.next(newMonth);
  }

  public formatCurrentMonth(): string {
    return this.currentMonth.format('MMMM YYYY');
  }

  private loadFromCache(month: string): void {
    const cachedData = this.cache.get(month);
    if (cachedData) {
      this.events = cachedData.events;
      this.freeDays = cachedData.freeDays;
      this.weekends = cachedData.weekends;
      // Generowanie harmonogramu po załadowaniu z cache
      this.generateSchedule();
    }
  }

  private clearCurrentMonthData(): void {
    this.events = [];
    this.freeDays = [];
    this.weekends = [];
    this.schedule.clear();
    this.isLoading = true;
    this.errorMessage = null; 
  }

  // Metoda do generowania dni miesiąca
  private generateDaysInMonth(month: Dayjs): void {
    const startOfMonth = month.startOf('month');
    const endOfMonth = month.endOf('month');
    const days: Dayjs[] = [];

    let currentDay = startOfMonth;

    while (currentDay.isBefore(endOfMonth) || currentDay.isSame(endOfMonth, 'day')) {
      days.push(currentDay);
      currentDay = currentDay.add(1, 'day');
    }

    this.daysInMonth = days;
  }

  // Metoda do generowania harmonogramu
  private generateSchedule(): void {
    // Inicjalizacja pustej mapy
    this.schedule = new Map();

    // Inicjalizacja dla każdego użytkownika
    this.users.forEach(user => {
      const userMap: Map<string, EventData[]> = new Map();
      this.daysInMonth.forEach(day => {
        userMap.set(day.format('YYYY-MM-DD'), []);
      });
      this.schedule.set(user.id, userMap);
    });

    // Przypisywanie wydarzeń
    this.events.forEach(event => {
      const userId = event.user.id;
      const date = dayjs(event.date).format('YYYY-MM-DD');
      if (this.schedule.has(userId)) {
        const userMap = this.schedule.get(userId)!;
        if (userMap.has(date)) {
          userMap.get(date)!.push({
            type: 'event',
            details: event
          });
        }
      }

      // Przypisywanie głównej zmiany użytkownika
      if (!this.primaryShiftMap.has(userId)) {
        this.primaryShiftMap.set(userId, event.shift_name);
        this.assignColorToShift(event.shift_name);
      }
    });

    // Przypisywanie dni wolnych
    this.freeDays.forEach(freeDay => {
      const userId = freeDay.user.id;
      const date = dayjs(freeDay.date).format('YYYY-MM-DD');
      if (this.schedule.has(userId)) {
        const userMap = this.schedule.get(userId)!;
        if (userMap.has(date)) {
          userMap.get(date)!.push({
            type: 'freeDay',
            details: freeDay
          });
        }
      }
    });

    // Przypisywanie weekendów
    this.weekends.forEach(weekend => {
      const userId = weekend.user.id;
      const date = dayjs(weekend.date).format('YYYY-MM-DD');
      if (this.schedule.has(userId)) {
        const userMap = this.schedule.get(userId)!;
        if (userMap.has(date)) {
          userMap.get(date)!.push({
            type: 'weekend',
            details: weekend
          });
        }
      }
    });
    this.sortUsersByShift();
  }

  private assignColorToShift(shiftName: string): void {
    if (!this.shiftColorMap.has(shiftName)) {
      if (this.shiftColorMap.size < this.shiftColors.length) {
        this.shiftColorMap.set(shiftName, this.shiftColors[this.shiftColorMap.size]);
      } else {
        const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        this.shiftColorMap.set(shiftName, randomColor);
      }
    }
  }

  private sortUsersByShift(): void {
    this.users.sort((a, b) => {
      const shiftA = this.primaryShiftMap.get(a.id) || '';
      const shiftB = this.primaryShiftMap.get(b.id) || '';
      return shiftA.localeCompare(shiftB);
    });
  }

  // Metoda pomocnicza do zwracania klas CSS na podstawie typu wydarzenia
  getEventClass(type: 'event' | 'freeDay' | 'weekend'): string {
    switch (type) {
      case 'event':
        return 'event';
      case 'freeDay':
        return 'free-day';
      case 'weekend':
        return 'weekend';
      default:
        return '';
    }
  }
}
