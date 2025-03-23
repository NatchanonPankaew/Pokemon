import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PokermonListComponent } from './pokemon-list/pokemon-list.component';
import { ItemsListComponent } from './items-list/items-list.component';
import { TeamComponent } from './team/team.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'pokemon-list', component: PokermonListComponent },  // แก้ไขการสะกดให้ถูกต้อง
  { path: 'item-list', component: ItemsListComponent},
  { path: 'team', component: TeamComponent},
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
