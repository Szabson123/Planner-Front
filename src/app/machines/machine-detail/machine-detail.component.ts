import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MachineService, MachineWholeInfo, Review } from '../../service/machine.service'; 
import { ReviewService } from '../../service/review.service'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-machine-detail',
  templateUrl: './machine-detail.component.html',
  styleUrls: ['./machine-detail.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class MachineDetailComponent implements OnInit {
  machineId!: number;
  machine!: MachineWholeInfo;
  reviews: Review[] = [];
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
    this.loadReviews(); // Pobieranie przeglądów tylko dla danej maszyny
  }

  loadMachine(): void {
    this.machineService.getMachineById(this.machineId).subscribe(data => {
      this.machine = data;
    }, error => {
      console.error('Błąd podczas pobierania danych maszyny', error);
    });
  }

  loadReviews(): void {
    this.reviewService.getReviews(this.machineId).subscribe(data => {
      this.reviews = data;
      this.sortReviews(); // Sortowanie przeglądów po ich pobraniu
    }, error => {
      console.error('Błąd podczas pobierania przeglądów maszyny', error);
    });
  }
  
  sortReviews(): void {
    this.reviews.sort((a, b) => Number(a.done) - Number(b.done));
  }

  toggleDone(review: Review): void {
    this.reviewService.toggleReviewDone(this.machineId, review.id).subscribe(() => {
      // Po udanej zmianie statusu, ponownie załaduj przeglądy, aby odświeżyć dane
      this.loadReviews();
    }, error => {
      console.error('Błąd podczas zmiany statusu przeglądu', error);
    });
  }
  
  deleteReview(review: Review): void {
    if (confirm('Czy na pewno chcesz usunąć ten przegląd?')) {
      this.reviewService.deleteReview(this.machineId, review.id).subscribe(() => {
        this.loadReviews(); // Odświeżenie listy przeglądów po usunięciu
      }, error => {
        console.error('Błąd podczas usuwania przeglądu', error);
      });
    }
  }

  addReview(): void {
    this.submitted = true;
    this.errorMessage = '';
    if (this.newReview.date && this.newReview.description) {
      this.reviewService.addReview(this.machineId, this.newReview).subscribe(() => {
        this.newReview = { date: '', description: '', done: false };
        this.submitted = false;
        this.loadReviews(); // Odświeżenie listy przeglądów po dodaniu nowego
      }, error => {
        console.error('Błąd podczas dodawania recenzji', error);
        this.errorMessage = 'Nie udało się dodać recenzji. Spróbuj ponownie później.';
      });
    }
  }
}
