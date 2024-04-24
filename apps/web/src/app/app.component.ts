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
  });
  products$?: Observable<Product[]>;
  searchResults$?: Observable<Product[]>;
  constructor(private productService: ProductService) {
    this.searchForm
      .get('searchQuery')
      ?.valueChanges.pipe(debounceTime(300))
      .subscribe((value) => {
        if (value) {
          this.searchResults$ = this.productService.searchProducts(value);
        } else {
          this.searchResults$ = undefined;
        }
      });
  }
  ngOnInit() {
    this.listProducts();
  }
  listProducts() {
    this.products$ = this.productService.listProduct(this.page, this.pageSize);
  }

  getImage(url: string) {
    return `${REST_API_URL}/images/${url}`;
  }
}
