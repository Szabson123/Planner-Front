import { Component } from '@angular/core';
import { PlanService } from '../service/plan.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-holy-day',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './addholyday.component.html',
  styleUrls: ['./addholyday.component.css']
})
export class AddHolyDayComponent {
  name: string = '';
  date: string = '';
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isLoading: boolean = false;

  constructor(
    private planService: PlanService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.name || !this.date) {
      this.errorMessage = 'Proszę wypełnić wszystkie pola.';
      this.successMessage = null;
      return;
    }

    this.isLoading = true;

    this.planService.addHolyDay(this.name, this.date).subscribe({
      next: (response) => {
        this.successMessage = 'Święto zostało dodane pomyślnie.';
        this.errorMessage = null;
        this.isLoading = false;
        this.router.navigate(['/plan']);
      },
      error: (error) => {
        console.error('Błąd podczas dodawania święta:', error);
        this.errorMessage = 'Wystąpił błąd podczas dodawania święta.';
        this.successMessage = null;
        this.isLoading = false;
      }
    });
  }
}
