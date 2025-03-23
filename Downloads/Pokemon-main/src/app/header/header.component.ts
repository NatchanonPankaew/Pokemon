import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';  // เพิ่มการนำเข้า RouterModule

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],  // เพิ่ม RouterModule ในรายการ imports
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  // ตรรกะของคอมโพเนนต์
}