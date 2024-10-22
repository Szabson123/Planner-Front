import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanService, Event, FreeDay, Weekend } from '../service/plan.service';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pl';
import { forkJoin, Subject, Subscription, EMPTY, of, Observable } from 'rxjs';
import { switchMap, distinctUntilChanged, catchError, tap, throttleTime, finalize, shareReplay } from 'rxjs/operators';

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

  private cache: { [month: string]: { events: Event[], freeDays: FreeDay[], weekends: Weekend[] } } = {};

  private inProgressRequests: { [month: string]: Observable<void> } = {};

  private navigationSubject = new Subject<Dayjs>();
  private preloadSubject = new Subject<string>();

  private navigationSubscription!: Subscription;
  private preloadSubscription!: Subscription;

  constructor(private planService: PlanService) {
    this.currentMonth = dayjs().startOf('month');
  }

  ngOnInit(): void {
    this.navigationSubscription = this.navigationSubject.pipe(
      throttleTime(300, undefined, { leading: true, trailing: true }),
      distinctUntilChanged((prev, curr) => prev.isSame(curr, 'month')),
      switchMap((newMonth) => {
        this.currentMonth = newMonth;
        this.clearCurrentMonthData();
        const currentMonthStr = this.currentMonth.format('YYYY-MM');

        if (this.cache[currentMonthStr]) {
          this.loadFromCache(currentMonthStr);
          this.isLoading = false;
          this.preloadAdjacentMonths(newMonth);
          return EMPTY;
        } else {
          return this.loadDataForMonthObservable(currentMonthStr, true).pipe(
            tap(() => {
              this.preloadAdjacentMonths(newMonth);
            })
          );
        }
      }),
      catchError((error) => {
        console.error('Błąd w subskrypcji nawigacji:', error);
        this.isLoading = false;
        return EMPTY;
      })
    ).subscribe();

    this.preloadSubscription = this.preloadSubject.pipe(
      switchMap((month) => this.loadDataForMonthObservable(month, false)),
      catchError((error) => {
        console.error('Błąd podczas preładowania:', error);
        return EMPTY;
      })
    ).subscribe();

    this.navigationSubject.next(this.currentMonth);
  }

  ngOnDestroy(): void {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
    if (this.preloadSubscription) {
      this.preloadSubscription.unsubscribe();
    }
  }

  private loadDataForMonthObservable(month: string, isCurrentMonth: boolean = false): Observable<void> {
    if (this.inProgressRequests[month]) {
      return this.inProgressRequests[month];
    }

    const monthDayjs = dayjs(month, 'YYYY-MM');

    const events$ = this.planService.getEventsForMonth(month);
    const freeDays$ = this.planService.getFreeDaysForMonth(month);
    const weekends$ = this.planService.getWeekendsForMonth(month);

    const load$ = forkJoin([events$, freeDays$, weekends$]).pipe(
      tap(([events, freeDays, weekends]) => {
        const filteredEvents = events.filter(event => dayjs(event.date).isSame(monthDayjs, 'month'));
        const filteredFreeDays = freeDays.filter(freeDay => dayjs(freeDay.date).isSame(monthDayjs, 'month'));
        const filteredWeekends = weekends.filter(weekend => dayjs(weekend.date).isSame(monthDayjs, 'month'));

        this.cache[month] = {
          events: filteredEvents,
          freeDays: filteredFreeDays,
          weekends: filteredWeekends
        };

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
          this.isLoading = false;
        }
        return EMPTY;
      }),
      finalize(() => {
        delete this.inProgressRequests[month];
      }),
      switchMap(() => of(void 0)),
      shareReplay(1)
    );

    this.inProgressRequests[month] = load$;

    return load$;
  }

  private preloadAdjacentMonths(newMonth: Dayjs): void {
    const previousMonthStr = newMonth.subtract(1, 'month').format('YYYY-MM');
    const nextMonthStr = newMonth.add(1, 'month').format('YYYY-MM');

    if (!this.cache[previousMonthStr]) {
      this.preloadSubject.next(previousMonthStr);
    }
    if (!this.cache[nextMonthStr]) {
      this.preloadSubject.next(nextMonthStr);
    }
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
    const cachedData = this.cache[month];
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
  }
}
