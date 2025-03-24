import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [
    CommonModule, 
    HttpClientModule, 
    FormsModule, 
    NgxPaginationModule,
    RouterModule
  ],
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.css']
})
export class PokemonListComponent implements OnInit {
  pokemon: any[] = [];
  filteredPokemon: any[] = [];
  searchTerm: string = '';
  page = 1;
  totalPokemons: number = 0;
  limit = 10;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.getPokemons();
  }

  getPokemons() {
    const offset = (this.page - 1) * this.limit;
    this.pokemon = [];
    this.filteredPokemon = [];
    
    this.dataService.getPokemons(1500, 0).subscribe((response: any) => {
      response.results.forEach((result: any) => {
        this.dataService.getMoreData(result.name).subscribe((uniqueResponse: any) => {
          this.pokemon.push(uniqueResponse);
          this.filteredPokemon = [...this.pokemon];
        });
      });
    });
  }

  refreshPokemon() {
    this.searchTerm = '';
    this.page = 1;
    this.getPokemons();
  }

  searchPokemon() {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredPokemon = this.pokemon.filter(p =>
      p.name.toLowerCase().startsWith(term)
    );
    this.page = 1;
  }
}