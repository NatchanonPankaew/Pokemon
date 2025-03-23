// team.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent {
  types: string[] = [
    'Bug', 'Dark', 'Dragon', 'Electric', 'Fairy', 'Fighting',
    'Fire', 'Flying', 'Ghost', 'Grass', 'Ground', 'Ice',
    'Normal', 'Poison', 'Psychic', 'Rock', 'Steel', 'Water'
  ];

  pokemonList: string[] = ['Pikachu', 'Charizard', 'Garchomp', 'Greninja', 'Lucario', 'Togekiss'];
  moveList: string[] = ['Thunderbolt', 'Flamethrower', 'Earthquake', 'Ice Beam', 'Aura Sphere'];
  itemList: string[] = ['Leftovers', 'Choice Scarf', 'Focus Sash', 'Life Orb'];
  abilityList: string[] = ['Overgrow', 'Blaze', 'Torrent', 'Levitate'];

  team = Array.from({ length: 6 }, () => ({
    name: '',
    moves: ['', '', '', ''],
    item: '',
    ability: ''
  }));
}
