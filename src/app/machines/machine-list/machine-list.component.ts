import { Component, OnInit } from '@angular/core';
import { MachineService, Machine } from '../../service/machine.service'; 
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from '../../truncate.pipe';

@Component({
  selector: 'app-machine-list',
  templateUrl: './machine-list.component.html',
  styleUrls: ['./machine-list.component.css'],
  standalone: true,
  imports: [CommonModule, TruncatePipe]
})
export class MachineListComponent implements OnInit {
  machines: Machine[] = [];

  constructor(private machineService: MachineService, private router: Router) { }

  ngOnInit(): void {
    this.machineService.getMachines().subscribe(data => {
      this.machines = data;
    });
  }

  viewMachine(id: number): void {
    this.router.navigate(['/machines', id]);
  }

  addMachine(): void {
    this.router.navigate(['/machines', 'add']);
  }
}
