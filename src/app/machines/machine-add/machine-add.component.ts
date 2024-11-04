import { Component } from '@angular/core';
import { MachineService, Machine } from '../../service/machine.service'; 
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-machine-add',
  templateUrl: './machine-add.component.html',
  styleUrls: ['./machine-add.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class MachineAddComponent {
  machine: Partial<Machine> = {
    name: '',
    location: '',
    description: ''
  };

  constructor(private machineService: MachineService, private router: Router) { }

  addMachine(): void {
    if (this.machine.name && this.machine.location && this.machine.description) {
      this.machineService.addMachine(this.machine as Machine).subscribe(() => {
        this.router.navigate(['/machines']);
      });
    }
  }
}
