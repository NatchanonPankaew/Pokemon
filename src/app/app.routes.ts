import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PokermonListComponent } from './pokemon-list/pokemon-list.component';  // แก้ไขการสะกดให้ถูกต้อง

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'pokemon-list', component: PokermonListComponent },  // แก้ไขการสะกดให้ถูกต้อง
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }