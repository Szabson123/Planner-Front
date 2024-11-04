import { Component } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    this.authService.login(this.username, this.password).subscribe(
      () => {
        console.log('Logowanie zakończone sukcesem, nawigacja do strony głównej...');
        this.router.navigate(['/']); // Nawiguj po zalogowaniu
        // Nie odświeżamy strony
      },
      (error) => {
        this.errorMessage = 'Nieprawidłowa nazwa użytkownika lub hasło';
      }
    );
  }
}
