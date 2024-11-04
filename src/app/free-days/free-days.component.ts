import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PlanService } from '../service/plan.service';
import { NgForm, FormsModule } from '@angular/forms';
import { start } from 'repl';
import { error } from 'console';
import { Router } from '@angular/router';


@Component({
  selector: 'app-free-days',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './free-days.component.html',
  styleUrl: './free-days.component.css',
})
export class FreeDaysComponent {
  constructor(private planService: PlanService, private router: Router) {}

  onSubmit(form: NgForm) {
    if (form.valid){
      const startDate = form.value.start_date;
      const endDate = form.value.end_date;
      const reason = form.value.reason;
    

    this.planService.addFreeDays(startDate, endDate, reason).subscribe(response => {
      console.log('Free days added:', response);
      form.reset();
      this.router.navigate(['/plan']);
    }, error => {
      console.error('Error adding free days:', error)
    })
    }
  }
}