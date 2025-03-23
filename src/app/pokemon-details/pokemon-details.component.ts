import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';  // Import Router for navigation
import { DataService } from '../services/data.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pokemon-details',
  standalone: true,
  imports: [CommonModule, RouterModule],  // Import CommonModule for *ngIf and *ngFor
  templateUrl: './pokemon-details.component.html',
  styleUrls: ['./pokemon-details.component.css']
})
export class PokemonDetailsComponent implements OnInit {
  pokemon: any;
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,  // Inject the service
    private router: Router  // Inject the router for navigation
  ) {}

  ngOnInit(): void {
    const pokemonName = this.route.snapshot.paramMap.get('id');  // Get Pokémon name from route params
    if (pokemonName) {
      this.dataService.getPokemonDetails(pokemonName).subscribe({
        next: (data) => {
          this.pokemon = data;  // Store Pokémon data in the pokemon variable
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load Pokémon details';
          this.loading = false;
        }
      });
    }
  }

  // Method to navigate back to the list of Pokémon
  goBackToList(): void {
    this.router.navigate(['/pokemon-list']);  // Navigate back to the Pokémon list page
  }
}
