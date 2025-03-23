// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http'; // For HttpClient
import { DataService } from './app/services/data.service'; // Import DataService

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(), // Provide HttpClient
    DataService // Provide DataService
  ]
})
.catch(err => console.error(err));