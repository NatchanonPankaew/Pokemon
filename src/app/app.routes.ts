import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PokemonListComponent } from './pokemon-list/pokemon-list.component';
import { ItemsListComponent } from './items-list/items-list.component';
import { TeamComponent } from './team/team.component';
import { PokemonDetailsComponent } from './pokemon-details/pokemon-details.component';
import { RandomComponent } from './random/random.component';
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'pokemon-list', component: PokemonListComponent },  // แก้ไขการสะกดให้ถูกต้อง
  { path: 'item-list', component: ItemsListComponent},
  { path: 'pokemon-details/:id', component: PokemonDetailsComponent},
  { path: 'team', component: TeamComponent},
  { path: 'random', component: RandomComponent},
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
