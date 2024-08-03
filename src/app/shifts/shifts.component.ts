import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgForm, FormsModule } from '@angular/forms';
import { Shift, PlanService } from '../service/plan.service';
import { User, UsersService } from '../service/users.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shifts',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.css']
})
export class ShiftsComponent implements OnInit {
  public users: User[] = [];
  public selectedUserIds: number[] = [];

  constructor(private planService: PlanService, private usersService: UsersService) {}

  ngOnInit() {
    this.usersService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  onCheckboxChange(event: any, userId: number) {
    if (event.target.checked) {
      this.selectedUserIds.push(userId);
    } else {
      this.selectedUserIds = this.selectedUserIds.filter(id => id !== userId);
    }
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      const shift: Shift = {
        users: this.selectedUserIds as any, // Przesyłanie wybranych identyfikatorów użytkowników jako tablica
        name: form.value.name,
        description: form.value.description,
        start_time: form.value.start_time,
        end_time: form.value.end_time
      };

      this.planService.addShift(shift).subscribe(response => {
        console.log('Shift created', response);
        form.reset();
        this.selectedUserIds = []; // Resetowanie zaznaczenia użytkowników
      }, error => {
        console.error('Something went wrong', error);
      });
    }
  }
}
