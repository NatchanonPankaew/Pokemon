import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  FormControl
} from '@angular/forms';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit {
  // type จาก API เช่น 'fire', 'water', 'grass' ...
  types: string[] = [];

  // dropdown options
  pokemonList: string[] = [];
  moveList: string[] = ['Thunderbolt', 'Flamethrower', 'Earthquake', 'Ice Beam', 'Aura Sphere'];
  itemList: string[] = ['Leftovers', 'Choice Scarf', 'Focus Sash', 'Life Orb'];
  abilityList: string[] = ['Overgrow', 'Blaze', 'Torrent', 'Levitate'];

  // form หลักของทีม
  teamForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    // สร้างฟอร์ม
    this.teamForm = this.fb.group({
      team: this.fb.array([])
    });

    // เพิ่มสมาชิก 6 ตัวในทีม
    for (let i = 0; i < 6; i++) {
      this.addPokemonToTeam();
    }

    // โหลดข้อมูลจาก API
    this.loadPokemonNames();
    this.loadPokemonTypes();
  }

  // getter สำหรับ FormArray
  get team(): FormArray {
    return this.teamForm.get('team') as FormArray;
  }

  // เพิ่ม Pokémon 1 ตัวในทีม
  addPokemonToTeam(): void {
    const pokemonGroup = this.fb.group({
      name: [''],
      moves: this.fb.array([
        this.fb.control(''),
        this.fb.control(''),
        this.fb.control(''),
        this.fb.control('')
      ]),
      item: [''],
      ability: ['']
      // ถ้าอยากเก็บ type เพิ่ม สามารถเพิ่ม formControlName: type: ['']
    });

    this.team.push(pokemonGroup);
  }

  // ดึง array ของ moves
  getMoves(pokemonIndex: number): FormArray {
    return this.team.at(pokemonIndex).get('moves') as FormArray;
  }

  // โหลดรายชื่อโปเกมอนจาก PokéAPI
  loadPokemonNames(): void {
    this.dataService.getPokemons(1000, 0).subscribe({
      next: (response: any) => {
        this.pokemonList = response.results.map((p: any) => p.name);
      },
      error: (err) => {
        console.error('Error loading Pokémon names:', err);
      }
    });
  }

  // โหลดประเภทโปเกมอน (types) จาก API
  loadPokemonTypes(): void {
    this.dataService.getPokemonTypes().subscribe({
      next: (response: any) => {
        this.types = response.results
          .map((t: any) => t.name)
          .filter((name: string) => name !== 'shadow' && name !== 'unknown');
      },
      error: (err) => {
        console.error('Error loading types:', err);
      }
    });
  }

  // ส่งฟอร์ม
  submitTeam(): void {
    console.log('Your Pokémon Team:', this.teamForm.value);
  }
}


