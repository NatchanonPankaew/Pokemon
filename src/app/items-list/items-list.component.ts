import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule, NgxPaginationModule],
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.css'],
})
export class ItemsListComponent implements OnInit {
  items: any[] = [];
  page = 1;
  totalItems: number = 0;
  limit = 10;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.getItems();
  }

  getItems() {
    const limit = this.limit;
    const offset = (this.page - 1) * limit;

    this.dataService.getItems(limit, offset).subscribe((response: any) => {
      this.totalItems = response.count;

      response.results.forEach((result: any) => {
        this.dataService.getItem(result.name).subscribe((itemDetails: any) => {
          this.items.push(itemDetails);
          console.log(this.items);
        });
      });
    });
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.items = []; // Clear the items array
    this.getItems(); // Fetch items for the new page
  }
}