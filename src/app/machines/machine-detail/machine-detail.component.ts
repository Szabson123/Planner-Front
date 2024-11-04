import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MachineService, MachineWholeInfo, Review } from '../../service/machine.service'; 
import { ReviewService } from '../../service/review.service'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewListComponent } from '../review-list/review-list.component'; 

@Component({
  selector: 'app-machine-detail',
  templateUrl: './machine-detail.component.html',
  styleUrls: ['./machine-detail.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReviewListComponent]
})
export class MachineDetailComponent implements OnInit {
  machineId!: number;
  machine!: MachineWholeInfo;
  newReview: Partial<Review> = {
    date: '',
    description: '',
    done: false
  };
  submitted: boolean = false;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private machineService: MachineService,
    private reviewService: ReviewService
  ) { }

  ngOnInit(): void {
    this.machineId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadMachine();
  }

  loadMachine(): void {
    this.machineService.getMachineById(this.machineId).subscribe(data => {
      this.machine = data;
    }, error => {
      console.error('Błąd podczas pobierania danych maszyny', error);
      // Możesz dodać obsługę błędów tutaj, np. wyświetlić komunikat dla użytkownika
    });
  }

  addReview(): void {
    this.submitted = true;
    this.errorMessage = '';
    if (this.newReview.date && this.newReview.description) {
      this.reviewService.addReview(this.machineId, this.newReview).subscribe(() => {
        // Reset formularza po dodaniu recenzji
        this.newReview = { date: '', description: '', done: false };
        this.submitted = false;
        // Recenzja zostanie automatycznie dodana przez ReviewListComponent dzięki Subject
      }, error => {
        console.error('Błąd podczas dodawania recenzji', error);
        this.errorMessage = 'Nie udało się dodać recenzji. Spróbuj ponownie później.';
      });
    }
  }
}
