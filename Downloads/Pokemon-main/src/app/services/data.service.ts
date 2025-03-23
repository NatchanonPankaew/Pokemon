import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private apiUrl = 'https://pokeapi.co/api/v2'; // Base URL for PokeAPI

  constructor(private http: HttpClient) {}

  // Fetch a list of Pokémon
  getPokemons(limit: number, offset: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/pokemon?limit=${limit}&offset=${offset}`);
  }

  // Fetch details for a specific Pokémon
  getMoreData(name: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/pokemon/${name}`);
  }

  // Fetch details for a specific item
  getItem(name: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/item/${name}`);
  }

  // Fetch a list of items
  getItems(limit: number, offset: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/item?limit=${limit}&offset=${offset}`);
  }

  getLocations(limit: number, offset: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/location?limit=${limit}&offset=${offset}`);
  }

  // Fetch details for a specific location
  getLocationDetails(name: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/location/${name}`);
  }
    // Fetch details for a specific Pokémon
    getPokemonDetails(name: string): Observable<any> {
      return this.http.get(`${this.apiUrl}/pokemon/${name}`);
    }
  
    // Fetch details for a specific ability
    getAbilityDetails(name: string): Observable<any> {
      return this.http.get(`${this.apiUrl}/ability/${name}`);
    }
}