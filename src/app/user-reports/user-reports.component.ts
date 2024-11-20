import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReportsService, Report } from '../service/report.service';
import { CommonModule } from '@angular/common'; 
import { UsersService, User } from '../service/users.service';

@Component({
  selector: 'app-user-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-reports.component.html',
  styleUrls: ['./user-reports.component.css']
})
export class UserReportsComponent implements OnInit {
  userId!: number;
  reports: Report[] = [];
  userName: string = 'Ładowanie...'; // Domyślny tekst podczas ładowania

  constructor(
    private route: ActivatedRoute,
    private reportsService: ReportsService,
    private usersService: UsersService,
  ) {}

  ngOnInit(): void {
    const userIdParam = this.route.snapshot.paramMap.get('userId');
    if (userIdParam) {
      this.userId = Number(userIdParam);
      this.loadUserName();   
      this.loadReports();    
    } else {
      console.error('Brak parametru userId w URL');
      this.userName = 'Nieznany użytkownik';
    }
  }

  loadUserName(): void {
    this.usersService.getUserById(this.userId).subscribe(
      user => {
        this.userName = `${user.first_name} ${user.last_name}`.trim() || 'Nieznany użytkownik';
      },
      error => {
        console.error('Błąd podczas pobierania użytkownika', error);
        this.userName = 'Błąd wczytywania użytkownika';
      }
    );
  }

  loadReports(): void {
    this.reportsService.getReportsByUser(this.userId).subscribe(
      data => {
        console.log('Otrzymane raporty:', data);
        this.reports = data;
      },
      error => {
        console.error('Błąd podczas pobierania raportów', error);
      }
    );
  }
}
