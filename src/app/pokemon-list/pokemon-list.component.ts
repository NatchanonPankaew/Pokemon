import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule, NgxPaginationModule],
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.css']
})
export class PokermonListComponent implements OnInit {
  pokemon: any[] = [];
  filteredPokemon: any[] = [];
  page = 1;
  totalPokemons: number = 0;
  limit = 10;

  searchForm: FormGroup = new FormGroup({
    keyword: new FormControl('')
  });

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.getPokemons();
    this.searchForm.get('keyword')?.valueChanges.subscribe(() => {
      this.searchPokemon();
    });
  }

  getPokemons() {
    this.pokemon = [];
    this.filteredPokemon = [];
    this.totalPokemons = 0;

    this.dataService.getPokemons(1500, 0).subscribe((response: any) => {
      this.totalPokemons = response.count;

      response.results.forEach((result: any) => {
        this.dataService.getMoreData(result.name).subscribe((details: any) => {
          this.pokemon.push(details);
          this.filteredPokemon = [...this.pokemon]; // แสดงทันทีหลังโหลด
        });
      });
    });
  }

  refreshPokemon() {
    this.searchForm.reset();
    this.page = 1;
    this.getPokemons();
  }

  searchPokemon() {
    const term = this.searchForm.get('keyword')?.value?.toLowerCase().trim() || '';
    if (term === '') {
      this.filteredPokemon = [...this.pokemon];
    } else {
      this.filteredPokemon = this.pokemon.filter(p =>
        p.name.toLowerCase().startsWith(term)
      );
    }
    this.page = 1;
  }

}