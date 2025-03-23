// src/app/app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // For common directives
import { PokermonListComponent } from './pokemon-list/pokemon-list.component';
import { HeaderComponent } from "./header/header.component"; // Import the component

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ PokermonListComponent, HeaderComponent], // Import PokermonListComponent
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'My Angular App';
}