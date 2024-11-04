import { Component, Input, OnInit } from '@angular/core';
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
  @Input() machineId!: number;
  reviews: Review[] = [];

  constructor(private reviewService: ReviewService) { }

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.reviewService.getallReviews(this.machineId).subscribe(data => {
      this.reviews = data;
    });
  }

  toggleDone(review: Review): void {
    this.reviewService.toggleReviewDone(review.id).subscribe(() => {
      review.done = !review.done;
    });
  }

  deleteReview(id: number): void {
    this.reviewService.deleteReview(id).subscribe(() => {
      this.reviews = this.reviews.filter(review => review.id !== id);
    });
  }
}
