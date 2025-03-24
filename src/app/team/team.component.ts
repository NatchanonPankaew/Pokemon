// team.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from '../services/data.service';

interface PokemonSlot {
  name: string;
  moves: string[];
  item: string;
  ability: string;
  types?: string[];
  sprite?: string;
  id?: number;
}

interface Suggestion {
  icon: string;
  text: string;
  priority?: number; // Higher number means higher priority
}

interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit {
  // Forms
  teamForm!: FormGroup;
  filtersForm!: FormGroup;
  
  // Loading state
  isLoading: boolean = true;

  // Pokemon types
  types: string[] = [
    'Bug', 'Dark', 'Dragon', 'Electric', 'Fairy', 'Fighting',
    'Fire', 'Flying', 'Ghost', 'Grass', 'Ground', 'Ice',
    'Normal', 'Poison', 'Psychic', 'Rock', 'Steel', 'Water'
  ];

  // Pokemon list from API
  allPokemon: any[] = [];
  pokemonList: string[] = [];
  
  // Moves list from API
  moveList: string[] = [];

  // Item list (could be from API in a full implementation)
  itemList: string[] = [];

  // Ability list from API
  abilityList: string[] = [];

  // Team data structure (will be used for reference with FormGroup)
  team: PokemonSlot[] = Array.from({ length: 6 }, () => ({
    name: '',
    moves: ['', '', '', ''],
    item: '',
    ability: '',
    types: []
  }));

  // Type effectiveness data - used for team analysis
  typeChart: Record<string, Record<string, number>> = {};

  // Team defense and coverage scores
  teamDefense: Record<string, number> = {};
  teamCoverage: Record<string, number> = {};
  
  // Team strengths and weaknesses (types)
  teamStrengths: string[] = [];
  teamWeaknesses: string[] = [];
  
  // Team suggestions
  teamSuggestions: Suggestion[] = [];

  // Move type mapping
  moveTypes: Record<string, string> = {};

  // Pokemon base stats data
  pokemonStats: Record<string, PokemonStats> = {};

  constructor(
    private dataService: DataService,
    private fb: FormBuilder
  ) {
    // Initialize type effectiveness chart and team analysis
    this.initializeTypeChart();
    this.initializeTeamAnalysis();
    
    // กำหนดค่าเริ่มต้นให้ฟอร์มใน constructor แทน
    this.teamForm = this.fb.group({
      format: ['vgc2024'],
      teamMembers: this.fb.array([])
    });
    
    this.filtersForm = this.fb.group({
      selectedFormat: [''],
      selectedType: [''],
      selectedGeneration: [''],
      searchQuery: [''],
      showLegendary: [false],
      showBaseStats: [false],
      showMetaAnalysis: [false]
    });
    
    // เพิ่ม Pokemon form groups เข้าไปใน teamMembers FormArray
    this.initializeTeamFormMembers();
  }
  ngOnInit(): void {
    // Load data from API
    this.loadInitialData();
    
    // Subscribe to form changes to update team analysis
    this.teamForm.valueChanges.subscribe(() => {
      this.updateTeamAnalysis();
    });
  }
  
  /**
   * เพิ่ม Pokemon form groups เข้าไปใน teamMembers FormArray
   */
  private initializeTeamFormMembers(): void {
    const teamMembersArray = this.teamForm.get('teamMembers') as FormArray;
    
    // Add 6 empty Pokemon slots
    for (let i = 0; i < 6; i++) {
      teamMembersArray.push(this.createPokemonFormGroup());
    }
  }
  
  /**
   * Create a form group for a single Pokemon
   */
  private createPokemonFormGroup(): FormGroup {
    return this.fb.group({
      name: [''],
      ability: [''],
      item: [''],
      moves: this.fb.array([
        new FormControl(''),
        new FormControl(''),
        new FormControl(''),
        new FormControl('')
      ])
    });
  }
  
  /**
   * Helper to get the team members FormArray
   */
  get teamMembers(): FormArray {
    return this.teamForm.get('teamMembers') as FormArray;
  }
  
  /**
   * Helper to get moves FormArray for a specific Pokemon
   */
  getPokemonMoves(index: number): FormArray {
    return this.teamMembers.at(index).get('moves') as FormArray;
  }
  
  /**
   * Helper to get types for a specific Pokemon
   */
  getPokemonTypes(index: number): string[] {
    const pokemonName = this.teamMembers.at(index).get('name')?.value;
    if (!pokemonName) return [];
    
    // Use typeMap if available
    if (this.typeMap[pokemonName]) {
      return this.typeMap[pokemonName];
    }
    
    // Otherwise try to find in allPokemon
    const pokemon = this.allPokemon.find(p => p.name === pokemonName);
    return pokemon?.types || [];
  }
  
  /**
   * Helper to get abilities for a specific Pokemon
   */
  getAbilitiesForPokemon(index: number): string[] {
    const pokemonName = this.teamMembers.at(index).get('name')?.value;
    return this.getPokemonAbilities(pokemonName);
  }
  
  /**
   * Helper to get moves for a specific Pokemon
   */
  getMovesForPokemon(index: number): string[] {
    // For this example, we return all moves
    // In a real implementation, you would filter based on the Pokemon
    return this.moveList;
  }

  /**
   * Load all necessary data from API
   */
  loadInitialData(): void {
    this.isLoading = true;

    // First load all Pokemon (limited to first 151 for now)
    this.dataService.getPokemons(151, 0).subscribe({
      next: (response: any) => {
        // Store Pokemon names for dropdown
        this.pokemonList = response.results.map((pokemon: any) => this.formatName(pokemon.name));
        
        // Load details for each Pokemon (types, stats, abilities, etc.)
        this.loadPokemonDetails(response.results);
        
        // Load moves data
        this.loadMoves();
        
        // Load items data
        this.loadItems();
      },
      error: (error) => {
        console.error('Error loading Pokemon data:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Load detailed data for each Pokemon
   */
  loadPokemonDetails(pokemonResults: any[]): void {
    let loadedCount = 0;
    const totalToLoad = pokemonResults.length;

    pokemonResults.forEach((pokemon: any) => {
      this.dataService.getMoreData(pokemon.name).subscribe({
        next: (pokemonData: any) => {
          // Extract and store relevant data
          this.storePokemonData(pokemonData);
          
          loadedCount++;
          if (loadedCount === totalToLoad) {
            // Now load other data once Pokemon are loaded
            this.isLoading = false;
            
            // Update team analysis
            this.updateTeamAnalysis();
          }
        },
        error: (error) => {
          console.error(`Error loading details for ${pokemon.name}:`, error);
          loadedCount++;
          if (loadedCount === totalToLoad) {
            this.isLoading = false;
          }
        }
      });
    });
  }

  /**
   * Store Pokemon data in appropriate structures
   */
  storePokemonData(pokemon: any): void {
    const name = this.formatName(pokemon.name);
    
    // Store Pokemon stats
    this.pokemonStats[name] = {
      hp: pokemon.stats.find((stat: any) => stat.stat.name === 'hp').base_stat,
      attack: pokemon.stats.find((stat: any) => stat.stat.name === 'attack').base_stat,
      defense: pokemon.stats.find((stat: any) => stat.stat.name === 'defense').base_stat,
      specialAttack: pokemon.stats.find((stat: any) => stat.stat.name === 'special-attack').base_stat,
      specialDefense: pokemon.stats.find((stat: any) => stat.stat.name === 'special-defense').base_stat,
      speed: pokemon.stats.find((stat: any) => stat.stat.name === 'speed').base_stat
    };
    
    // Store Pokemon types
    const types = pokemon.types.map((type: any) => this.formatName(type.type.name));
    
    // Store in the typeMap used by updatePokemonTypes
    this.typeMap[name] = types;
    
    // Store abilities in abilities list if not already present
    pokemon.abilities.forEach((ability: any) => {
      const abilityName = this.formatName(ability.ability.name);
      if (!this.abilityList.includes(abilityName)) {
        this.abilityList.push(abilityName);
      }
    });
    
    // Store full Pokemon data in allPokemon array
    this.allPokemon.push({
      id: pokemon.id,
      name: name,
      types: types,
      stats: this.pokemonStats[name],
      sprite: pokemon.sprites.front_default || pokemon.sprites.other['official-artwork'].front_default,
      abilities: pokemon.abilities.map((ability: any) => ({
        name: this.formatName(ability.ability.name),
        isHidden: ability.is_hidden
      }))
    });
  }

  /**
   * Load moves data from API
   */
  loadMoves(): void {
    // In a real implementation, you would fetch this from the API
    // For this example, we'll use a simplified set
    this.moveList = [
      'Thunderbolt', 'Flamethrower', 'Earthquake', 'Ice Beam', 
      'Aura Sphere', 'Dragon Claw', 'Close Combat', 'Shadow Ball',
      'Hydro Pump', 'Solar Beam', 'Psychic', 'Dark Pulse'
    ];
    
    // Set move types
    this.moveTypes = {
      'Thunderbolt': 'Electric',
      'Flamethrower': 'Fire',
      'Earthquake': 'Ground',
      'Ice Beam': 'Ice',
      'Aura Sphere': 'Fighting',
      'Dragon Claw': 'Dragon',
      'Close Combat': 'Fighting',
      'Shadow Ball': 'Ghost',
      'Hydro Pump': 'Water',
      'Solar Beam': 'Grass',
      'Psychic': 'Psychic',
      'Dark Pulse': 'Dark'
    };
  }

  /**
   * Load items data from API
   */
  loadItems(): void {
    // In a real implementation, you would fetch this from the API
    // For this example, we'll use a simplified set
    this.itemList = [
      'Leftovers', 'Choice Scarf', 'Focus Sash', 'Life Orb',
      'Choice Band', 'Assault Vest', 'Rocky Helmet', 'Expert Belt'
    ];
  }

  /**
   * Format name from API (e.g., "special-attack" -> "Special Attack")
   */
  formatName(name: string): string {
    if (!name) return '';
    
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Initializes the Pokemon type effectiveness chart
   */
  private initializeTypeChart(): void {
    // Initialize with neutral effectiveness
    this.types.forEach(type => {
      this.typeChart[type] = {};
      this.types.forEach(defType => {
        this.typeChart[type][defType] = 1; // Normal effectiveness
      });
    });

    // Set type effectiveness - complete chart
    // Fire relationships
    this.typeChart['Fire']['Bug'] = 2;
    this.typeChart['Fire']['Grass'] = 2;
    this.typeChart['Fire']['Ice'] = 2;
    this.typeChart['Fire']['Steel'] = 2;
    this.typeChart['Fire']['Fire'] = 0.5;
    this.typeChart['Fire']['Water'] = 0.5;
    this.typeChart['Fire']['Rock'] = 0.5;
    this.typeChart['Fire']['Dragon'] = 0.5;

    // Water relationships
    this.typeChart['Water']['Fire'] = 2;
    this.typeChart['Water']['Ground'] = 2;
    this.typeChart['Water']['Rock'] = 2;
    this.typeChart['Water']['Water'] = 0.5;
    this.typeChart['Water']['Grass'] = 0.5;
    this.typeChart['Water']['Dragon'] = 0.5;

    // Electric relationships
    this.typeChart['Electric']['Water'] = 2;
    this.typeChart['Electric']['Flying'] = 2;
    this.typeChart['Electric']['Electric'] = 0.5;
    this.typeChart['Electric']['Grass'] = 0.5;
    this.typeChart['Electric']['Dragon'] = 0.5;
    this.typeChart['Electric']['Ground'] = 0;

    // Grass relationships
    this.typeChart['Grass']['Water'] = 2;
    this.typeChart['Grass']['Ground'] = 2;
    this.typeChart['Grass']['Rock'] = 2;
    this.typeChart['Grass']['Fire'] = 0.5;
    this.typeChart['Grass']['Grass'] = 0.5;
    this.typeChart['Grass']['Poison'] = 0.5;
    this.typeChart['Grass']['Flying'] = 0.5;
    this.typeChart['Grass']['Bug'] = 0.5;
    this.typeChart['Grass']['Dragon'] = 0.5;
    this.typeChart['Grass']['Steel'] = 0.5;

    // Ice relationships
    this.typeChart['Ice']['Grass'] = 2;
    this.typeChart['Ice']['Ground'] = 2;
    this.typeChart['Ice']['Flying'] = 2;
    this.typeChart['Ice']['Dragon'] = 2;
    this.typeChart['Ice']['Fire'] = 0.5;
    this.typeChart['Ice']['Water'] = 0.5;
    this.typeChart['Ice']['Ice'] = 0.5;
    this.typeChart['Ice']['Steel'] = 0.5;

    // Fighting relationships
    this.typeChart['Fighting']['Normal'] = 2;
    this.typeChart['Fighting']['Ice'] = 2;
    this.typeChart['Fighting']['Rock'] = 2;
    this.typeChart['Fighting']['Dark'] = 2;
    this.typeChart['Fighting']['Steel'] = 2;
    this.typeChart['Fighting']['Poison'] = 0.5;
    this.typeChart['Fighting']['Flying'] = 0.5;
    this.typeChart['Fighting']['Psychic'] = 0.5;
    this.typeChart['Fighting']['Bug'] = 0.5;
    this.typeChart['Fighting']['Fairy'] = 0.5;
    this.typeChart['Fighting']['Ghost'] = 0;

    // Add more type effectiveness relationships...
    // In a full implementation, this data would be fetched from an API
  }

  /**
   * Initializes team analysis data structures
   */
  private initializeTeamAnalysis(): void {
    this.types.forEach(type => {
      this.teamDefense[type] = 0;
      this.teamCoverage[type] = 0;
    });
    this.teamStrengths = [];
    this.teamWeaknesses = [];
    this.teamSuggestions = [];
  }

  /**
   * Updates team analysis when team composition changes
   */
  updateTeamAnalysis(): void {
    // Reset analysis
    this.initializeTeamAnalysis();

    // Get current form value for the team
    const formValue = this.teamForm.value;
    
    // Calculate team defense and coverage
    formValue.teamMembers?.forEach((pokemon: any, index: number) => {
      if (pokemon.name && this.getPokemonTypes(index).length > 0) {
        // Create a local PokemonSlot object to use with existing methods
        const pokemonSlot: PokemonSlot = {
          name: pokemon.name,
          moves: pokemon.moves || [],
          item: pokemon.item || '',
          ability: pokemon.ability || '',
          types: this.getPokemonTypes(index)
        };
        
        // Update defense analysis
        this.updateDefenseAnalysis(pokemonSlot);
        
        // Update coverage analysis
        this.updateCoverageAnalysis(pokemonSlot);
      }
    });

    // Determine team strengths and weaknesses
    this.calculateTeamStrengthsWeaknesses();
    
    // Generate team suggestions
    this.generateTeamSuggestions();
  }

  /**
   * Updates defense analysis for a specific Pokemon
   */
  private updateDefenseAnalysis(pokemon: PokemonSlot): void {
    if (!pokemon.types || pokemon.types.length === 0) return;

    // For each attacking type
    this.types.forEach(attackType => {
      let effectiveness = 1;
      
      // Calculate type effectiveness against this Pokemon
      pokemon.types!.forEach(defenseType => {
        effectiveness *= this.typeChart[attackType][defenseType] || 1;
      });
      
      // Update team defense score
      // Increment if resistant (effectiveness < 1)
      // Decrement if weak (effectiveness > 1)
      if (effectiveness < 1) {
        this.teamDefense[attackType] += 1;  // Resistant
      } else if (effectiveness > 1) {
        this.teamDefense[attackType] -= 1;  // Weak
      }
    });
  }

  /**
   * Updates coverage analysis for a specific Pokemon
   */
  private updateCoverageAnalysis(pokemon: PokemonSlot): void {
    if (!pokemon.moves) return;

    // For each move the Pokemon has
    pokemon.moves.forEach(move => {
      if (!move) return;
      
      // Get the type of the move
      const moveType = this.moveTypes[move];
      if (!moveType) return;
      
      // For each defending type
      this.types.forEach(defenseType => {
        // Get effectiveness of this move against the defense type
        const effectiveness = this.typeChart[moveType][defenseType] || 1;
        
        // Increment coverage if super effective
        if (effectiveness > 1) {
          this.teamCoverage[defenseType] += 1;
        }
      });
    });
  }

  /**
   * Calculates team strengths and weaknesses based on defense analysis
   */
  private calculateTeamStrengthsWeaknesses(): void {
    this.teamStrengths = [];
    this.teamWeaknesses = [];
    
    this.types.forEach(type => {
      const score = this.teamDefense[type] || 0;
      
      // If score is positive, team is resistant to this type
      if (score >= 2) {
        this.teamStrengths.push(type);
      }
      // If score is negative, team is weak to this type
      else if (score <= -2) {
        this.teamWeaknesses.push(type);
      }
    });

    // Sort by alphabetical order
    this.teamStrengths.sort();
    this.teamWeaknesses.sort();
  }

  /**
   * Generates suggestions for improving the team
   */
  private generateTeamSuggestions(): void {
    this.teamSuggestions = [];
    
    // Check if there's any Pokemon on the team
    const hasTeamMembers = this.hasTeamMembers();
    if (!hasTeamMembers) {
      this.teamSuggestions.push({
        icon: '🏁',
        text: 'Start by adding your first Pokémon to the team!',
        priority: 10
      });
      return;
    }
    
    // Check for team weaknesses
    if (this.teamWeaknesses.length > 0) {
      const weaknessesStr = this.teamWeaknesses.join(', ');
      let suggestion = `Your team is weak to ${weaknessesStr}.`;
      
      // Suggest types that could help counter the weaknesses
      const recommendedTypes: string[] = [];
      
      this.teamWeaknesses.forEach(weakness => {
        // Find types that resist or are immune to the weakness
        this.types.forEach(type => {
          if (this.typeChart[weakness][type] < 1 && !recommendedTypes.includes(type)) {
            recommendedTypes.push(type);
          }
        });
      });
      
      if (recommendedTypes.length > 0) {
        const recTypesStr = recommendedTypes.slice(0, 3).join(', ');
        suggestion += ` Consider adding a ${recTypesStr} type.`;
      }
      
      this.teamSuggestions.push({
        icon: '🛡️',
        text: suggestion,
        priority: 9
      });
    }
    
    // Check for coverage gaps
    const poorCoverage = this.types.filter(type => this.teamCoverage[type] === 0);
    if (poorCoverage.length > 0) {
      const missingCoverage = poorCoverage.slice(0, 3).join(', ');
      this.teamSuggestions.push({
        icon: '📊',
        text: `Your team lacks coverage against ${missingCoverage}. Add moves that are strong against these types.`,
        priority: 8
      });
    }
    
    // Check for good coverage
    const goodCoverage = this.types.filter(type => this.teamCoverage[type] >= 2);
    if (goodCoverage.length >= this.types.length / 2) {
      this.teamSuggestions.push({
        icon: '⚡',
        text: `Great offensive coverage! Your team covers ${goodCoverage.length}/${this.types.length} types effectively.`,
        priority: 5
      });
    }
    
    // Check for duplicate types
    const typeCount: Record<string, number> = {};
    for (let i = 0; i < this.teamMembers.length; i++) {
      const types = this.getPokemonTypes(i);
      types.forEach(type => {
        typeCount[type] = (typeCount[type] || 0) + 1;
      });
    }
    
    const duplicateTypes = Object.keys(typeCount).filter(type => typeCount[type] > 2);
    if (duplicateTypes.length > 0) {
      const dupTypes = duplicateTypes.join(', ');
      this.teamSuggestions.push({
        icon: '⚠️',
        text: `You have many ${dupTypes} type Pokémon. Consider diversifying your team for better type coverage.`,
        priority: 7
      });
    }
    
    // Check team completion
    const filledSlots = this.teamMembers.controls.filter(control => control.get('name')?.value).length;
    if (filledSlots < 6) {
      this.teamSuggestions.push({
        icon: '➕',
        text: `Your team has ${filledSlots}/6 Pokémon. Add ${6 - filledSlots} more to complete your team.`,
        priority: 6
      });
    }
    
    // Check team stat balance
    this.analyzeBattleStats();
    
    // Sort suggestions by priority
    this.teamSuggestions.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    // Limit to top 3 suggestions
    this.teamSuggestions = this.teamSuggestions.slice(0, 3);
  }

  /**
   * Analyze team's battle statistics and provide suggestions
   */
  private analyzeBattleStats(): void {
    // Skip if less than 3 Pokemon in team
    const filledSlots = this.teamMembers.controls.filter(control => control.get('name')?.value).length;
    if (filledSlots < 3) return;

    // Get team stat averages
    const averages = this.getTeamStatAverages();
    
    // Check physical vs special balance
    const physicalRatio = averages.attack / (averages.attack + averages.specialAttack);
    
    if (physicalRatio > 0.7) {
      this.teamSuggestions.push({
        icon: '💪',
        text: 'Your team is heavily focused on physical attacks. Consider adding Special Attackers.',
        priority: 6
      });
    } else if (physicalRatio < 0.3) {
      this.teamSuggestions.push({
        icon: '✨',
        text: 'Your team is heavily focused on special attacks. Consider adding Physical Attackers.',
        priority: 6
      });
    }

    // Check team's speed tier
    if (averages.speed < 70) {
      this.teamSuggestions.push({
        icon: '🐢',
        text: 'Your team is quite slow. Consider adding faster Pokémon or speed control moves.',
        priority: 7
      });
    } else if (averages.speed > 100) {
      this.teamSuggestions.push({
        icon: '⚡',
        text: 'Your team has great speed! Use this advantage with priority moves and setup strategies.',
        priority: 4
      });
    }

    // Check defensive balance
    const defenseRatio = averages.defense / (averages.defense + averages.specialDefense);
    
    if (defenseRatio > 0.65 || defenseRatio < 0.35) {
      this.teamSuggestions.push({
        icon: '🛡️',
        text: 'Your team\'s defensive stats are unbalanced. Consider diversifying your defensive Pokémon.',
        priority: 5
      });
    }
  }

  // Type mapping for Pokemon
  typeMap: Record<string, string[]> = {};

  /**
   * Updates Pokemon types when a Pokemon is selected
   */
  updatePokemonTypes(index: number): void {
    const pokemonName = this.teamMembers.at(index).get('name')?.value;
    if (!pokemonName) return;
    
    // Find Pokemon in our data
    const pokemonData = this.allPokemon.find(p => p.name === pokemonName);
    
    if (pokemonData) {
      // For reactive form, we don't directly update the types in the form
      // as we access them through getPokemonTypes()
      
      // Update abilities for this Pokemon
      this.updatePokemonAbilities(index);
    }
    
    // Update team analysis
    this.updateTeamAnalysis();
  }

  /**
   * Update available abilities based on selected Pokemon
   */
  updatePokemonAbilities(index: number): void {
    const pokemonName = this.teamMembers.at(index).get('name')?.value;
    if (!pokemonName) return;
    
    // Find Pokemon in our data
    const pokemonData = this.allPokemon.find(p => p.name === pokemonName);
    
    if (pokemonData && pokemonData.abilities) {
      // If the current ability isn't available for this Pokemon, reset it
      const validAbilities = pokemonData.abilities.map((a: any) => a.name);
      const currentAbility = this.teamMembers.at(index).get('ability')?.value;
      
      if (currentAbility && !validAbilities.includes(currentAbility)) {
        this.teamMembers.at(index).get('ability')?.setValue('');
      }
    }
  }

  /**
   * Gets Pokemon abilities
   */
  getPokemonAbilities(pokemonName: string): string[] {
    if (!pokemonName) return [];
    
    // Find the Pokemon in our data
    const pokemonData = this.allPokemon.find(p => p.name === pokemonName);
    
    if (pokemonData && pokemonData.abilities) {
      // Return list of ability names for this Pokemon
      return pokemonData.abilities.map((ability: any) => ability.name);
    }
    
    // Default empty array if Pokemon or abilities not found
    return [];
  }

  /**
   * Gets Pokemon sprite URL
   */
  getPokemonSprite(pokemonName: string): string {
    const pokemon = this.allPokemon.find(p => p.name === pokemonName);
    if (pokemon && pokemon.sprite) {
      return pokemon.sprite;
    }
    
    // Default sprite if not found
    return 'assets/img/pokemon-placeholder.png';
  }

  /**
   * Gets CSS class for a type box based on effectiveness value
   */
  getTypeBoxClass(type: string, value: number): string {
    const baseClass = 'type-' + type.toLowerCase();
    
    if (!value || value === 0) {
      return ''; // No specific type styling for neutral
    }
    
    return baseClass; // Return the type class for non-zero values
  }

  /**
   * Gets tooltip text for defense type box
   */
  getTypeDefenseTooltip(type: string): string {
    const value = this.teamDefense[type] || 0;
    
    if (value > 0) {
      return `Your team resists ${type}-type attacks`;
    } else if (value < 0) {
      return `Your team is weak to ${type}-type attacks`;
    }
    
    return `Your team has neutral resistance to ${type}-type attacks`;
  }

  /**
   * Gets tooltip text for coverage type box
   */
  getTypeCoverageTooltip(type: string): string {
    const value = this.teamCoverage[type] || 0;
    
    if (value > 0) {
      return `${value} moves in your team are super effective against ${type}-type Pokémon`;
    }
    
    return `Your team lacks super effective moves against ${type}-type Pokémon`;
  }

  /**
   * Gets the base stat value for a Pokemon
   */
  getStatValue(pokemonName: string, statName: keyof PokemonStats): number {
    if (!pokemonName) return 0;
    
    const stats = this.pokemonStats[pokemonName];
    if (!stats) return 0;
    
    return stats[statName];
  }

  /**
   * Gets the percentage representation of a stat for the stat bar
   */
  getStatPercentage(pokemonName: string, statName: keyof PokemonStats): number {
    const statValue = this.getStatValue(pokemonName, statName);
    if (!statValue) return 0;
    
    // Maximum base stat values for reference (approximate)
    const maxStats = {
      hp: 255, // Blissey has 255 HP
      attack: 190, // Slaking has 160 Attack
      defense: 230, // Shuckle has 230 Defense
      specialAttack: 194, // Deoxys-Attack has 180 Sp. Atk
      specialDefense: 230, // Shuckle has 230 Sp. Def
      speed: 180 // Deoxys-Speed has 180 Speed
    };
    
    // Calculate percentage based on max possible value
    const percentage = (statValue / maxStats[statName]) * 100;
    
    // Ensure the percentage is at least 5% for visibility and max 100%
    return Math.min(Math.max(percentage, 5), 100);
  }

  /**
   * Determines if a stat is considered "high" (for styling purposes)
   */
  isHighStat(pokemonName: string, statName: keyof PokemonStats): boolean {
    const value = this.getStatValue(pokemonName, statName);
    
    // Thresholds for considering a stat "high"
    const highThresholds = {
      hp: 90,
      attack: 110,
      defense: 100,
      specialAttack: 110,
      specialDefense: 100,
      speed: 100
    };
    
    return value >= highThresholds[statName];
  }

  /**
   * Determines if a stat is considered "low" (for styling purposes)
   */
  isLowStat(pokemonName: string, statName: keyof PokemonStats): boolean {
    const value = this.getStatValue(pokemonName, statName);
    
    // Thresholds for considering a stat "low"
    const lowThresholds = {
      hp: 50,
      attack: 60,
      defense: 60,
      specialAttack: 60,
      specialDefense: 60,
      speed: 60
    };
    
    return value <= lowThresholds[statName];
  }

  /**
   * Gets CSS class for a stat value based on whether it's high or low
   */
  getStatValueClass(pokemonName: string, statName: keyof PokemonStats): string {
    if (this.isHighStat(pokemonName, statName)) {
      return 'high';
    } else if (this.isLowStat(pokemonName, statName)) {
      return 'low';
    }
    
    return '';
  }

  /**
   * Get team stat averages for analysis
   */
  getTeamStatAverages(): PokemonStats {
    // Initialize averages object
    const averages: PokemonStats = {
      hp: 0,
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0
    };
    
    // Count filled team slots
    let filledSlots = 0;
    
    // Sum up stats for all Pokemon in the team
    for (let i = 0; i < this.teamMembers.length; i++) {
      const pokemonName = this.teamMembers.at(i).get('name')?.value;
      if (pokemonName) {
        filledSlots++;
        
        // Add each stat to the running total
        averages.hp += this.getStatValue(pokemonName, 'hp');
        averages.attack += this.getStatValue(pokemonName, 'attack');
        averages.defense += this.getStatValue(pokemonName, 'defense');
        averages.specialAttack += this.getStatValue(pokemonName, 'specialAttack');
        averages.specialDefense += this.getStatValue(pokemonName, 'specialDefense');
        averages.speed += this.getStatValue(pokemonName, 'speed');
      }
    }
    
    // Calculate averages if there are Pokemon in the team
    if (filledSlots > 0) {
      averages.hp /= filledSlots;
      averages.attack /= filledSlots;
      averages.defense /= filledSlots;
      averages.specialAttack /= filledSlots;
      averages.specialDefense /= filledSlots;
      averages.speed /= filledSlots;
    }
    
    return averages;
  }

/**
 * Calculate total base stats for a Pokemon
 */
calculateTotalStats(pokemonName: string): number {
  if (!pokemonName) return 0;
  
  const stats = this.pokemonStats[pokemonName];
  if (!stats) return 0;
  
  return stats.hp + stats.attack + stats.defense + 
         stats.specialAttack + stats.specialDefense + stats.speed;
}

/**
 * Check if team has any members
 */
hasTeamMembers(): boolean {
  return this.teamMembers.controls.some(control => control.get('name')?.value);
}

/**
 * Get stat display name for UI
 */
getStatDisplayName(statKey: string): string {
  const displayNames: Record<string, string> = {
    'hp': 'HP',
    'attack': 'Atk',
    'defense': 'Def',
    'specialAttack': 'SpA',
    'specialDefense': 'SpD',
    'speed': 'Spd'
  };
  
  return displayNames[statKey] || statKey;
}

/**
 * Get color for stat bar based on stat name
 */
getStatColor(statName: keyof PokemonStats): string {
  const colorMap: Record<string, string> = {
    hp: '#FF5959',
    attack: '#F5AC78',
    defense: '#FAE078',
    specialAttack: '#9DB7F5',
    specialDefense: '#A7DB8D',
    speed: '#FA92B2'
  };
  
  return colorMap[statName] || '#777777';
}

/**
 * Get color for stat bar based on stat name (with gradient)
 */
getStatBarColor(statKey: string): string {
  const colors: Record<string, string> = {
    'hp': 'linear-gradient(to right, #FF5959, #ff8080)',
    'attack': 'linear-gradient(to right, #F5AC78, #f7c4a3)',
    'defense': 'linear-gradient(to right, #FAE078, #f9eaae)',
    'specialAttack': 'linear-gradient(to right, #9DB7F5, #c7d4f9)',
    'specialDefense': 'linear-gradient(to right, #A7DB8D, #c9eab8)',
    'speed': 'linear-gradient(to right, #FA92B2, #ffc3d3)'
  };
  
  return colors[statKey] || 'gray';
}

/**
 * Get team stat percentage (for visualization)
 */
getTeamStatPercentage(statName: keyof PokemonStats): number {
  const averages = this.getTeamStatAverages();
  const value = averages[statName] || 0;
  
  // Maximum base stat values for reference
  const maxStats = {
    hp: 255,
    attack: 190,
    defense: 230,
    specialAttack: 194,
    specialDefense: 230,
    speed: 180
  };
  
  // Calculate percentage
  const percentage = (value / maxStats[statName]) * 100;
  
  // Ensure the percentage is at least 5% for visibility and max 100%
  return Math.min(Math.max(percentage, 5), 100);
}

/**
 * Create a new team
 */
createNewTeam(): void {
  // Reset the form for each Pokemon in the team
  for (let i = 0; i < this.teamMembers.length; i++) {
    this.teamMembers.at(i).get('name')?.setValue('');
    this.teamMembers.at(i).get('ability')?.setValue('');
    this.teamMembers.at(i).get('item')?.setValue('');
    
    const moves = this.getPokemonMoves(i);
    for (let j = 0; j < moves.length; j++) {
      moves.at(j).setValue('');
    }
  }
  
  // Update team analysis
  this.updateTeamAnalysis();
}

/**
 * Save team
 */
saveTeam(): void {
  // In a real implementation, you would save to storage
  console.log('Saving team:', this.teamForm.value);
  // Could also trigger a service to save to a database or localStorage
}

/**
 * Toggle import/export modal
 */
toggleImportExport(): void {
  // In a real implementation, this would show a modal
  console.log('Import/Export team');
  
  // For example:
  const teamJson = JSON.stringify(this.teamForm.value, null, 2);
  console.log('Export JSON:', teamJson);
}

/**
 * Import team data from JSON
 */
importTeam(teamData: string): void {
  try {
    const importedTeam = JSON.parse(teamData);
    
    // Validate the team data structure
    if (importedTeam && importedTeam.teamMembers && Array.isArray(importedTeam.teamMembers)) {
      // Reset current team
      this.createNewTeam();
      
      // Import team format if present
      if (importedTeam.format) {
        this.teamForm.get('format')?.setValue(importedTeam.format);
      }
      
      // Import team members
      importedTeam.teamMembers.forEach((pokemon: any, index: number) => {
        if (index < this.teamMembers.length) {
          // Set name
          this.teamMembers.at(index).get('name')?.setValue(pokemon.name || '');
          
          // Set ability and item
          this.teamMembers.at(index).get('ability')?.setValue(pokemon.ability || '');
          this.teamMembers.at(index).get('item')?.setValue(pokemon.item || '');
          
          // Set moves
          const movesArray = this.teamMembers.at(index).get('moves') as FormArray;
          if (pokemon.moves && Array.isArray(pokemon.moves)) {
            pokemon.moves.forEach((move: string, moveIndex: number) => {
              if (moveIndex < movesArray.length) {
                movesArray.at(moveIndex).setValue(move || '');
              }
            });
          }
          
          // Update types based on selected Pokemon
          this.updatePokemonTypes(index);
        }
      });
      
      // Update team analysis
      this.updateTeamAnalysis();
    }
  } catch (error) {
    console.error('Error importing team data:', error);
  }
}

/**
 * Calculate effectiveness of a type against a dual-type Pokemon
 */
calculateTypeEffectiveness(attackType: string, defenseTypes: string[]): number {
  if (!attackType || !defenseTypes || defenseTypes.length === 0) return 1;
  
  let effectiveness = 1;
  
  // Multiply effectiveness against each defense type
  defenseTypes.forEach(defenseType => {
    effectiveness *= this.typeChart[attackType][defenseType] || 1;
  });
  
  return effectiveness;
}

/**
 * Get CSS class for type effectiveness display
 */
getEffectivenessClass(effectiveness: number): string {
  if (effectiveness === 0) return 'immune';
  if (effectiveness < 1) return 'resistant';
  if (effectiveness > 1) return 'weak';
  return 'neutral';
}

/**
 * Get text label for type effectiveness
 */
getEffectivenessLabel(effectiveness: number): string {
  if (effectiveness === 0) return 'Immune';
  if (effectiveness === 0.25) return '¼×';
  if (effectiveness === 0.5) return '½×';
  if (effectiveness === 1) return '1×';
  if (effectiveness === 2) return '2×';
  if (effectiveness === 4) return '4×';
  return `${effectiveness}×`;
}
}