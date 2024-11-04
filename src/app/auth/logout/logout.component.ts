import { Component } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  template: '',
  standalone: true,
})
export class LogoutComponent {
  constructor(private authService: AuthService, private router: Router) {
    this.authService.logout();
  }
}