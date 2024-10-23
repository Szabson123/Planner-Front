import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanService, Event, FreeDay, Weekend } from '../service/plan.service';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pl';
import { BehaviorSubject, Subscription, EMPTY, Observable, of, forkJoin } from 'rxjs';
import { switchMap, distinctUntilChanged, catchError, tap, debounceTime, finalize, shareReplay, retry, map } from 'rxjs/operators';

@Component({
  selector: 'app-plan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.css']
})
export class PlanComponent implements OnInit, OnDestroy {
  public events: Event[] = [];
  public freeDays: FreeDay[] = [];
  public weekends: Weekend[] = [];
  public currentMonth: Dayjs;
  public isLoading = true;
  public errorMessage: string | null = null; // Dodane do obsługi błędów

  private cache: Map<string, { events: Event[], freeDays: FreeDay[], weekends: Weekend[] }> = new Map();
  private readonly CACHE_LIMIT = 12; // Maksymalna liczba miesięcy w cache

  private inProgressRequests: Map<string, Observable<void>> = new Map();

  private navigationSubject = new BehaviorSubject<Dayjs>(dayjs().startOf('month'));
  
  private navigationSubscription!: Subscription;
  private dataFetchSubscription!: Subscription;
  private isInitialLoad = true;

  constructor(private planService: PlanService) {
    this.currentMonth = this.navigationSubject.value;
  }

  ngOnInit(): void {
    // Subskrypcja 1: Obsługuje nawigację i aktualizuje widok natychmiast
    this.navigationSubscription = this.navigationSubject.pipe(
      distinctUntilChanged((prev, curr) => prev.isSame(curr, 'month'))
    ).subscribe(newMonth => {
      this.currentMonth = newMonth;
      this.clearCurrentMonthData();
      const monthStr = this.currentMonth.format('YYYY-MM');

      if (this.cache.has(monthStr)) {
        this.loadFromCache(monthStr);
        this.isLoading = false;

        // Preładowanie sąsiadujących miesięcy tylko przy pierwszym załadowaniu
        if (this.isInitialLoad) {
          this.isInitialLoad = false;
          this.preloadAdjacentMonths(newMonth).subscribe();
        }
      } else {
        this.isLoading = true;
        // Dane będą ładowane przez drugą subskrypcję po debounceTime
      }
    });

    // Subskrypcja 2: Debounces nawigację i zarządza ładowaniem danych
    this.dataFetchSubscription = this.navigationSubject.pipe(
      debounceTime(300), // Debounce tylko na ładowanie danych
      distinctUntilChanged((prev, curr) => prev.isSame(curr, 'month')),
      switchMap(newMonth => {
        const monthStr = newMonth.format('YYYY-MM');

        if (this.cache.has(monthStr)) {
          // Dane już są w cache, nic nie robimy
          return EMPTY;
        } else {
          return this.loadDataForMonthObservable(monthStr, true).pipe(
            tap(() => {
              if (this.isInitialLoad) {
                this.isInitialLoad = false;
                this.preloadAdjacentMonths(newMonth).subscribe();
              }
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
  }

  ngOnDestroy(): void {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
    if (this.dataFetchSubscription) {
      this.dataFetchSubscription.unsubscribe();
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
      retry(2), // Ponów próbę 2 razy w przypadku błędu
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

        // Utrzymanie limitu cache
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
      map(() => void 0), // Przekształcenie Observable<void[]> na Observable<void>
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
    }
  }

  private clearCurrentMonthData(): void {
    this.events = [];
    this.freeDays = [];
    this.weekends = [];
    this.isLoading = true;
    this.errorMessage = null; // Resetowanie komunikatu o błędzie
  }
}
