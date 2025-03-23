// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router'; // เพิ่มการนำเข้า provideRouter
import { DataService } from './app/services/data.service';
import { routes } from './app/app.routes'; // นำเข้าเส้นทางจากไฟล์ routes หรือ routing module

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes), // เพิ่ม provider สำหรับ Router
    DataService
  ]
})
.catch(err => console.error(err));