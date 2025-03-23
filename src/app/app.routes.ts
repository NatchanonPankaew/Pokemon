import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PokemonListComponent } from './pokemon-list/pokemon-list.component';
import { ItemsListComponent } from './items-list/items-list.component';
import { PokemonDetailsComponent } from './pokemon-details/pokemon-details.component';
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'pokemon-list', component: PokemonListComponent },
  { path: 'item-list', component: ItemsListComponent },
  { path: 'pokemon-details/:id', component: PokemonDetailsComponent},
  { path: '**', redirectTo: '' }  // wildcard for unknown paths
];
