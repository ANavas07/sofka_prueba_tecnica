import { Observable } from "rxjs";
import { Product } from "../models/product.model";

export interface ProductResponse {
    message: string;
    data: Product;
}

export interface IProductsService {
    getProducts(): Observable<Product[]>;
    create(product: Product): Observable<ProductResponse>;
    verifyId(id: string): Observable<boolean>;
    update(id: string, product: Partial<Product>): Observable<ProductResponse>;
}
