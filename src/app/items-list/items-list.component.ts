import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule, NgxPaginationModule],
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.css'],
})
export class ItemsListComponent implements OnInit {
  items: any[] = [];
  filteredItems: any[] = [];
  page = 1;
  totalItems = 0;
  limit = 10;

  searchForm: FormGroup = new FormGroup({
    keyword: new FormControl('')
  });

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.getItems();

    this.searchForm.get('keyword')?.valueChanges.subscribe(() => {
      this.searchItems();
    });
  }

  getItems() {
    const offset = (this.page - 1) * this.limit;
    this.items = [];
    this.filteredItems = [];

    this.dataService.getItems(3000, 0).subscribe((response: any) => {
      this.totalItems = response.count;

      response.results.forEach((result: any) => {
        this.dataService.getItem(result.name).subscribe((itemDetails: any) => {
          this.items.push(itemDetails);
          this.filteredItems = [...this.items];
        });
      });
    });
  }

  searchItems() {
    const term = this.searchForm.get('keyword')?.value?.toLowerCase().trim() || '';
    if (term === '') {
      this.filteredItems = [...this.items];
    } else {
      this.filteredItems = this.items.filter(item =>
        item.name.toLowerCase().startsWith(term)
      );
    }
    this.page = 1;
  }

  refreshItems() {
    this.searchForm.reset();
    this.page = 1;
    this.getItems();
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.getItems();
  }
}