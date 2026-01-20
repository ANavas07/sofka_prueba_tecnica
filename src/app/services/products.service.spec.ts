import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductsService } from './products.services';
import { Product } from '../models/product.model';

describe('ProductsService', () => {
    let service: ProductsService;
    let httpMock: HttpTestingController;
    const apiUrl = 'http://localhost:3002/bp/products';

    const mockProduct: Product = {
        id: 'test-1',
        name: 'Test Product',
        description: 'Test Description',
        logo: 'http://test.com/logo.png',
        date_release: new Date('2025-01-01'),
        date_revision: new Date('2026-01-01')
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ProductsService]
        });
        service = TestBed.inject(ProductsService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getProducts', () => {
        it('should return products array', () => {
            const mockResponse = { data: [mockProduct] };

            service.getProducts().subscribe(products => {
                expect(products.length).toBe(1);
                expect(products[0]).toEqual(mockProduct);
            });

            const req = httpMock.expectOne(apiUrl);
            expect(req.request.method).toBe('GET');
            req.flush(mockResponse);
        });
    });

    describe('create', () => {
        it('should create a product', () => {
            const mockResponse = { message: 'Created', data: mockProduct };

            service.create(mockProduct).subscribe(response => {
                expect(response.message).toBe('Created');
                expect(response.data).toEqual(mockProduct);
            });

            const req = httpMock.expectOne(apiUrl);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(mockProduct);
            req.flush(mockResponse);
        });
    });

    describe('verifyId', () => {
        it('should verify if ID exists', () => {
            const id = 'test-1';

            service.verifyId(id).subscribe(exists => {
                expect(exists).toBeTruthy();
            });

            const req = httpMock.expectOne(`${apiUrl}/verification/${id}`);
            expect(req.request.method).toBe('GET');
            req.flush(true);
        });
    });

    describe('update', () => {
        it('should update a product', () => {
            const id = 'test-1';
            const updates = { name: 'Updated Name' };
            const mockResponse = { message: 'Updated', data: { ...mockProduct, ...updates } };

            service.update(id, updates).subscribe(response => {
                expect(response.message).toBe('Updated');
            });

            const req = httpMock.expectOne(`${apiUrl}/${id}`);
            expect(req.request.method).toBe('PUT');
            expect(req.request.body).toEqual(updates);
            req.flush(mockResponse);
        });
    });
});