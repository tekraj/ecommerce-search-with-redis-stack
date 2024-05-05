import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { MdbCarouselModule } from 'mdb-angular-ui-kit/carousel';
import { Observable, Subject, debounceTime } from 'rxjs';

import type { Product } from '@ecommerce/database';

import { REST_API_URL } from '../environments/environment';
import { ProductService } from './services/product.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MdbCarouselModule, ReactiveFormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  page = 1;
  pageSize = 50;
  searchForm = new FormGroup({
    searchQuery: new FormControl(''),
    elasticSearchQuery: new FormControl(''),
    redisSearchQuery: new FormControl(''),
  });
  products$?: Observable<Product[]>;
  searchResults$?: Observable<Product[]>;
  elasticSearchResults$?: Observable<Product[]>;
  redisSearchResults$?: Observable<Product[]>;
  constructor(private productService: ProductService) {}
  ngOnInit() {
    this.listProducts();
  }
  listProducts() {
    this.products$ = this.productService.listProduct(this.page, this.pageSize);
  }

  getImage(url: string) {
    return `${REST_API_URL}/images/${url}`;
  }
  search(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    if (value) {
      this.searchResults$ = this.productService.searchProducts(value);
    } else {
      this.searchResults$ = undefined;
    }
  }
  elasticSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    if (value) {
      this.elasticSearchResults$ =
        this.productService.elasticSearchProducts(value);
    } else {
      this.elasticSearchResults$ = undefined;
    }
  }
  redisSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    if (value) {
      this.redisSearchResults$ = this.productService.redisSearchProducts(value);
    } else {
      this.redisSearchResults$ = undefined;
    }
  }
}
