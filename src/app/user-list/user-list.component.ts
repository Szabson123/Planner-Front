import { Component, OnInit } from '@angular/core';
import { UsersService, User } from '../service/users.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  users: User[] = [];

  constructor(private usersService: UsersService, private router: Router) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.usersService.getUsers().subscribe(data => {
      this.users = data;
    }, error => {
      console.error('Błąd podczas pobierania listy użytkowników', error);
    });
  }
  viewReports(userId: number): void {
    this.router.navigate([`/users/${userId}/reports`]);
  }
}