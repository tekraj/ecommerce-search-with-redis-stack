import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Product } from '@ecommerce/database';

import { REST_API_URL } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private http: HttpClient) {}
  listProduct(page = 1, pageSize = 50): Observable<Product[]> {
    return this.http.get<Product[]>(
      `${REST_API_URL}/products/${page}/${pageSize}`,
    );
  }
  searchProducts(text: string): Observable<string[]> {
    return this.http.get<string[]>(`${REST_API_URL}/products/search/${text}`);
  }
  elasticSearchProducts(text: string): Observable<string[]> {
    return this.http.get<string[]>(
      `${REST_API_URL}/products/search-elastic/${text}`,
    );
  }
  redisSearchProducts(text: string): Observable<string[]> {
    return this.http.get<string[]>(
      `${REST_API_URL}/products/search-redis/${text}`,
    );
  }
}
