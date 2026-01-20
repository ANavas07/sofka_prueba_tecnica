import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Products } from './products';
import { ProductsService } from '../../services/products.services';
import { ToastService } from '../../services/toastService';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';

describe('Products Component', () => {
  let component: Products;
  let fixture: ComponentFixture<Products>;
  let productServiceSpy: jest.Mocked<ProductsService>;
  let toastServiceSpy: jest.Mocked<ToastService>;
  let routerSpy: jest.Mocked<Router>;

  const mockProducts = [
    {
      id: 'test-1',
      name: 'Producto Test',
      description: 'Descripción del producto',
      logo: 'https://ex.com/logo.png',
      date_release: new Date('2025-01-01'),
      date_revision: new Date('2026-01-01')
    },
    {
      id: 'test-2',
      name: 'Otro Producto',
      description: 'Otra descripción',
      logo: 'https://ex.com/logo2.png',
      date_release: new Date('2025-02-01'),
      date_revision: new Date('2026-02-01')
    }
  ];

  beforeEach(async () => {
    productServiceSpy = {
      getProducts: jest.fn().mockReturnValue(of(mockProducts)),
      create: jest.fn(),
      verifyId: jest.fn(),
      update: jest.fn()
    } as any;

    toastServiceSpy = {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn()
    } as any;

    routerSpy = {
      navigate: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [Products, FormsModule],
      providers: [
        { provide: ProductsService, useValue: productServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Products);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load products on init', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(productServiceSpy.getProducts).toHaveBeenCalled();
      expect(component.products.length).toBe(2);
    }));

    it('should show error toast when loading fails', fakeAsync(() => {
      productServiceSpy.getProducts.mockReturnValue(throwError(() => new Error('Network error')));
      
      fixture.detectChanges();
      tick();

      expect(toastServiceSpy.error).toHaveBeenCalled();
    }));
  });

  describe('applyFilters', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should filter products by search term', () => {
      component.searchTerm = 'Otro';
      component.applyFilters();

      expect(component.filteredProducts.length).toBe(1);
      expect(component.filteredProducts[0].name).toBe('Otro Producto');
    });

    it('should return all products when search is empty', () => {
      component.searchTerm = '';
      component.applyFilters();

      expect(component.filteredProducts.length).toBe(2);
    });

    it('should limit results by pageSize', () => {
      component.pageSize = 1;
      component.applyFilters();

      expect(component.filteredProducts.length).toBe(1);
    });

    it('should filter by description', () => {
      component.searchTerm = 'Otra descripción';
      component.applyFilters();

      expect(component.filteredProducts.length).toBe(1);
    });
  });

  describe('onSearchChange', () => {
    it('should call applyFilters', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const spy = jest.spyOn(component, 'applyFilters');
      component.onSearchChange();

      expect(spy).toHaveBeenCalled();
    }));
  });

  describe('onPageSizeChange', () => {
    it('should call applyFilters', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const spy = jest.spyOn(component, 'applyFilters');
      component.onPageSizeChange();

      expect(spy).toHaveBeenCalled();
    }));
  });

  describe('resultCount', () => {
    it('should return filtered products count', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(component.resultCount).toBe(2);
    }));
  });

  describe('navigation', () => {
    it('should navigate to add product', () => {
      component.onAddProduct();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/products/agregar']);
    });

    it('should navigate to edit product', () => {
      component.onEditProduct(mockProducts[0]);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/products/editar', 'test-1']);
    });
  });
});