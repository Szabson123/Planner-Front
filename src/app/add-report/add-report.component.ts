import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ReportsService, Report } from '../service/report.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { QuillModule } from 'ngx-quill'; // Import QuillModule

@Component({
  selector: 'app-add-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QuillModule], // Dodaj QuillModule
  templateUrl: './add-report.component.html',
  styleUrls: ['./add-report.component.css']
})
export class AddReportComponent {
  raportForm: FormGroup;
  selectedImages: File[] = [];
  previewImages: string[] = [];
  uploadProgress: number = 0;
  uploadError: string = '';
  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }], 
      ['link', 'image']                      
    ]
  };

  constructor(
    private raportService: ReportsService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.raportForm = this.fb.group({
      text: ['', Validators.required],
      images: [null]
    });
  }

  onFileChange(event: any): void {
    const maxFiles = 5;
    const maxSize = 5 * 1024 * 1024; // 5 MB
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (event.target.files && event.target.files.length) {
      const files: FileList = event.target.files;

      if (files.length > maxFiles) {
        alert(`Możesz dodać maksymalnie ${maxFiles} obrazów.`);
        return;
      }

      this.selectedImages = [];
      this.previewImages = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!validTypes.includes(file.type)) {
          alert(`Nieprawidłowy typ pliku: ${file.name}`);
          continue;
        }
        if (file.size > maxSize) {
          alert(`Plik ${file.name} przekracza maksymalny rozmiar 5 MB.`);
          continue;
        }
        this.selectedImages.push(file);

        // Generowanie podglądu obrazu
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewImages.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  submitRaport(): void {
    if (this.raportForm.invalid) {
      this.raportForm.markAllAsTouched();
      return;
    }

    const text = this.raportForm.get('text')?.value;
    const images = this.selectedImages;

    console.log('Submitting Raport with text:', text);
    console.log('Submitting Raport with images:', images);

    this.raportService.addRaport(text, images).subscribe(
      (event: HttpEvent<Report>) => {
        switch (event.type) {
          case HttpEventType.Sent:
            console.log('Żądanie wysłane.');
            break;
          case HttpEventType.UploadProgress:
            if (event.total) {
              this.uploadProgress = Math.round((100 * event.loaded) / event.total);
            }
            break;
          case HttpEventType.Response:
            console.log('Raport dodany pomyślnie', event.body);
            this.raportForm.reset();
            this.selectedImages = [];
            this.previewImages = [];
            this.uploadProgress = 0;
            alert('Raport został dodany pomyślnie!');
            this.router.navigate(['/']); // Przekierowanie po dodaniu raportu
            break;
        }
      },
      (error) => {
        console.error('Błąd podczas dodawania raportu', error);
        this.uploadError = error.message;
        this.uploadProgress = 0;
      }
    );
  }
}
