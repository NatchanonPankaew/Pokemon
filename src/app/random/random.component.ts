import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-random',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './random.component.html',
  styleUrls: ['./random.component.css']
})
export class RandomComponent implements OnInit {
  randomOne: any = null;
  totalPokemons: number = 0;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.getTotalCount();
  }

  // 1️⃣ ดึงจำนวนทั้งหมด
  getTotalCount() {
    this.http.get<any>('https://pokeapi.co/api/v2/pokemon?limit=1').subscribe(response => {
      this.totalPokemons = response.count; // เช่น 1302
    });
  }

  // 2️⃣ สุ่มและดึงโปเกมอน
  getRandomPokemon() {
    if (this.totalPokemons > 0) {
      const randomId = Math.floor(Math.random() * this.totalPokemons) + 1;

      this.http.get<any>(`https://pokeapi.co/api/v2/pokemon/${randomId}`).subscribe(data => {
        this.randomOne = data;
      });
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }
}