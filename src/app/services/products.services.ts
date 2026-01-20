import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable, of } from "rxjs";
import { Product } from "../models/product.model";
import { IProductsService, ProductResponse } from "../interfaces/iProductsService";

@Injectable({
    providedIn: 'root'
})
export class ProductsService implements IProductsService {
    private readonly apiUrl = "http://localhost:3002/bp/products";

    constructor(private http: HttpClient) { }

    getProducts(): Observable<Product[]> {
        return this.http.get<{ data: Product[] }>(this.apiUrl).pipe(
            map(response => response.data)
        );
    }

    create(product: Product): Observable<ProductResponse> {
        return this.http.post<ProductResponse>(`${this.apiUrl}`, product);
    }

    verifyId(id: string): Observable<boolean> {
        return this.http.get<boolean>(`${this.apiUrl}/verification/${id}`);
    }

    update(id: string, product: Partial<Product>): Observable<ProductResponse> {
        return this.http.put<ProductResponse>(`${this.apiUrl}/${id}`, product);
    }
}

