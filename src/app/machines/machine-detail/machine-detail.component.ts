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
    });
  }

  addReview(): void {
    if (this.newReview.date && this.newReview.description) {
      this.reviewService.addReview(this.machineId, this.newReview).subscribe(() => {
        this.newReview = { date: '', description: '', done: false };
        this.loadMachine();
      });
    }
  }
}
