  import { HttpClient, HttpErrorResponse } from '@angular/common/http';
  import { Injectable } from '@angular/core';
  import { Observable, throwError } from 'rxjs';
  import { catchError } from 'rxjs/operators';

  @Injectable({
    providedIn: 'root',
  })

  export class DataService {
    private apiUrl = 'https://pokeapi.co/api/v2'; // Base URL for PokeAPI
    

    constructor(private http: HttpClient) {}

    getPokemonDetails(name: string): Observable<any> {
      return this.http.get(`${this.apiUrl}/pokemon/${name}`);
    }

    // Generic error handler
    private handleError(error: HttpErrorResponse) {
      console.error('An error occurred:', error);
      return throwError('Something went wrong. Please try again later.');
    }

    // Fetch a list of Pokémon
    getPokemons(limit: number, offset: number): Observable<any> {
      return this.http.get(`${this.apiUrl}/pokemon?limit=${limit}&offset=${offset}`)
        .pipe(catchError(this.handleError));
    }

    // Fetch details for a specific Pokémon
    getMoreData(name: string): Observable<any> {
      return this.http.get(`${this.apiUrl}/pokemon/${name}`)
        .pipe(catchError(this.handleError));
    }

    // Fetch details for a specific item
    getItem(name: string): Observable<any> {
      return this.http.get(`${this.apiUrl}/item/${name}`)
        .pipe(catchError(this.handleError));
    }

    // Fetch a list of items
    getItems(limit: number, offset: number): Observable<any> {
      return this.http.get(`${this.apiUrl}/item?limit=${limit}&offset=${offset}`)
        .pipe(catchError(this.handleError));
    }

    // Fetch a list of locations
    getLocations(limit: number, offset: number): Observable<any> {
      return this.http.get(`${this.apiUrl}/location?limit=${limit}&offset=${offset}`)
        .pipe(catchError(this.handleError));
    }

    // Fetch details for a specific location
    getLocationDetails(name: string): Observable<any> {
      return this.http.get(`${this.apiUrl}/location/${name}`)
        .pipe(catchError(this.handleError));
    }


    // Fetch details for a specific ability
    getAbilityDetails(name: string): Observable<any> {
      return this.http.get(`${this.apiUrl}/ability/${name}`)
        .pipe(catchError(this.handleError));
    }
    getNextPage(url: string): Observable<any> {
      return this.http.get(url).pipe(catchError(this.handleError));
    }
    
    getPreviousPage(url: string): Observable<any> {
      return this.http.get(url).pipe(catchError(this.handleError));
    }

    getPokemonTypes(): Observable<any> {
      return this.http.get(`${this.apiUrl}/type`)
        .pipe(catchError(this.handleError));
    }
  }