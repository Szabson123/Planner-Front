// review-list.component.ts

import { Component, OnInit } from '@angular/core';
import { ReviewService, Review } from '../../service/review.service'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ReviewListComponent implements OnInit {
  reviews: Review[] = [];

  constructor(private reviewService: ReviewService) { }

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.reviewService.getallReviews().subscribe(data => {
      this.reviews = data;
      this.sortReviews(); // Sortowanie recenzji po załadowaniu
    }, error => {
      console.error('Błąd podczas pobierania wszystkich przeglądów', error);
    });
  }

  sortReviews(): void {
    this.reviews.sort((a, b) => Number(a.done) - Number(b.done));
  }

  toggleDone(review: Review): void {
    this.reviewService.toggleReviewDone(review.machine_id, review.id).subscribe(() => {
      this.loadReviews(); // Odświeżenie listy po zmianie statusu
    }, error => {
      console.error('Błąd podczas zmiany statusu przeglądu', error);
    });
  }

  deleteReview(review: Review): void {
    if (confirm('Czy na pewno chcesz usunąć ten przegląd?')) {
      this.reviewService.deleteReview(review.machine_id, review.id).subscribe(() => {
        this.loadReviews(); // Odświeżenie listy po usunięciu
      }, error => {
        console.error('Błąd podczas usuwania przeglądu', error);
      });
    }
  }
}
