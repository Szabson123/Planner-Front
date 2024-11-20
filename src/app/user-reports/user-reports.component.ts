// src/app/user-reports/user-reports.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReportsService, Report } from '../service/report.service';
import { CommonModule } from '@angular/common'; 
import { UsersService, User } from '../service/users.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SafeHtmlPipe } from '../pipes/safe-html.pipe';

@Component({
  selector: 'app-user-reports',
  standalone: true,
  imports: [CommonModule, SafeHtmlPipe], // Dodaj SafeHtmlPipe do imports
  templateUrl: './user-reports.component.html',
  styleUrls: ['./user-reports.component.css']
})
export class UserReportsComponent implements OnInit {
  userId!: number;
  reports: Report[] = [];
  userName: string = 'Ładowanie...'; 
  selectedImage: string | null = null; 
  isModalOpen: boolean = false; 

  constructor(
    private route: ActivatedRoute,
    private reportsService: ReportsService,
    private usersService: UsersService,
    private sanitizer: DomSanitizer
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
        this.reports = data.map(report => ({
          ...report,
          images: report.images?.map(image => ({
            ...image,
            img: String(image.img),
          })) || [], // Upewnia się, że images jest zawsze tablicą
        }));
      },
      error => {
        console.error('Błąd podczas pobierania raportów', error);
      }
    );
  }

  openImage(imageUrl: string): void {
    this.selectedImage = imageUrl;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.selectedImage = null;
    this.isModalOpen = false;
  }
}
