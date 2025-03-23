import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DataService } from './services/data.service'; // Import your service
import { PokemonDetailsComponent } from '../app/pokemon-details/pokemon-details.component'; // Import your component

@NgModule({
  imports: [    
    BrowserModule,
    // You do not need to declare PokemonDetailsComponent here anymore
  ],
  providers: [DataService],
})
export class AppModule {}
