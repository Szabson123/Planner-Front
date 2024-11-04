// app.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './service/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ]
})
export class AppComponent implements OnInit {
  isLoggedIn$!: Observable<boolean>;
  userName$!: Observable<string | null>;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isLoggedIn$ = this.authService.currentUser.pipe(
      map(token => token !== null)
    );

    this.userName$ = this.authService.userProfile.pipe(
      map(profile => profile?.first_name || profile?.username || null)
    );
  }
}
