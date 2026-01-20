import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../services/products.services';
import { Dropdown } from '../../shared/components/dropdown/dropdown';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toastService';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule, Dropdown],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];

  searchTerm: string = '';
  pageSize: number = 5;

  constructor(
    private productService: ProductsService,
    private router: Router,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.toastService.error('Error fetching products: ' + error.message);
      }
    });
  }

  applyFilters(): void {
    let result = [...this.products];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    }
    this.filteredProducts = result.slice(0, this.pageSize);
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onPageSizeChange(): void {
    this.applyFilters();
  }

  get resultCount(): number {
    return this.filteredProducts.length;
  }

  onEditProduct(product: Product): void {
    this.router.navigate(['/products/editar', product.id], {
      state: { product: product }
    });
  }

  onDeleteProduct(productId: string): void {
    console.log('Eliminar producto:', productId);
  }

  onAddProduct(): void {
    this.router.navigate(['/products/agregar']);
  }

}
