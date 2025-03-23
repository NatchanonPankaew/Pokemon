import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // 🔹 ใช้กับ ngModel
import { NgxPaginationModule } from 'ngx-pagination';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, NgxPaginationModule],
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.css']
})
export class PokermonListComponent implements OnInit {
  pokemon: any[] = [];              // ข้อมูลโปเกมอนทั้งหมด
  filteredPokemon: any[] = [];     // ข้อมูลที่กรองจากการค้นหา
  searchTerm: string = '';         // คำค้นหา
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
    this.searchTerm = '';       // เคลียร์ช่องค้นหา
    this.page = 1;              // กลับไปหน้าแรก
    this.getPokemons();        // โหลดข้อมูลใหม่
  }

  searchPokemon() {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredPokemon = this.pokemon.filter(p =>
      p.name.toLowerCase().startsWith(term)
    );

    this.page = 1; // รีเซ็ตหน้า
  }

}
