import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For common directives like *ngIf, *ngFor
import { HttpClientModule } from '@angular/common/http'; // For HTTP calls
import { NgxPaginationModule } from 'ngx-pagination'; // Import NgxPaginationModule
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-pokemon-list',
  standalone: true, // Mark as standalone
  imports: [CommonModule, HttpClientModule, NgxPaginationModule], // Add NgxPaginationModule
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.css'
})
export class PokermonListComponent implements OnInit {
  pokemon: any[] = []; // Define the pokemon property
  page = 1;
  totalPokemons: number = 0; // Initialize with a default value
  limit = 10; // Number of items per page

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.getPokemons();
  }

  getPokemons() {
    const limit = 10;
    const offset = (this.page - 1) * limit;

    this.dataService.getPokemons(limit, offset).subscribe((response: any) => {
      this.totalPokemons = response.count;

      response.results.forEach((result: any) => {
        this.dataService.getMoreData(result.name).subscribe((uniqueResponse: any) => {
          this.pokemon.push(uniqueResponse);
          console.log(this.pokemon);
        });
      });
    });
  }
}