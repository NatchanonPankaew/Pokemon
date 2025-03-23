import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router'; 
import { HeaderComponent } from "./header/header.component"; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, RouterOutlet, HeaderComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'PokémonDex';  // อัปเดตชื่อให้ตรงกับแอป

  ngOnInit() {
    // แอนิเมชันเมื่อโหลดหน้า
    document.body.style.transition = "opacity 1s";
    document.body.style.opacity = "0";
    setTimeout(() => {
      document.body.style.opacity = "1";
    }, 100);
  }

  ngAfterViewInit() {
    this.setupScrollListener();
    this.setupButtonEffects();
    this.setupTooltips();
  }

  private setupScrollListener() {
    // โค้ดการตรวจจับการเลื่อนหน้า
  }

  private createScrollMessage() {
    // โค้ดสร้างข้อความเมื่อเลื่อนหน้า
  }

  private setupButtonEffects() {
    // โค้ดสำหรับเอฟเฟกต์ปุ่ม
  }

  private setupTooltips() {
    // โค้ดสำหรับทูลทิป
  }
}