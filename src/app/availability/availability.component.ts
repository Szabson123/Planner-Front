import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Availability, PlanService } from '../service/plan.service';
import { NgForm, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-availability',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './availability.component.html',
  styleUrl: './availability.component.css'
})
export class AvailabilityComponent {
  constructor(private planService: PlanService) {}

  onSubmit(form: NgForm) {
    if (form.valid) {
      const availability: Availability = {
        date: form.value.date,
        acceptance: form.value.acceptance
      };

      this.planService.addAvailability(availability).subscribe(response => {
        console.log('Availability added:', response);
        form.reset();
      }, error => {
        console.error('Error adding availability:', error); 
      });
    }
  }
}
