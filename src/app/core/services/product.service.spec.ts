
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { Subject } from 'rxjs';

import { ProductService } from './product.service';
import { OfflineQueueService } from './offline-queue.service';
import { OfflineSyncService } from './offline-sync.service';
import { Product } from '../../models/product.model';

describe('ProductService', () => {
  let service: ProductService;
  let controller: HttpTestingController;
  let syncSubject: Subject<Product>;

  const testProduct: Product = {
    id: 100,
    name: 'Croquetas para perro',
    description: 'Alimento para perros adultos',
    category: 'Alimento para perros',
    price: 25000,
    stock: 10,
    available: true
  };

  beforeEach(() => {
    syncSubject = new Subject<Product>();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: OfflineQueueService,
          useValue: {
            enqueue: vi.fn().mockReturnValue(true)
          }
        },
        {
          provide: OfflineSyncService,
          useValue: {
            syncCompleted$: syncSubject.asObservable()
          }
        }
      ]
    });

    service = TestBed.inject(ProductService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load products from the API', () => {
    service.loadProducts();

    expect(service.loading()).toBe(true);

    const request = controller.expectOne('/api/v1/products');
    expect(request.request.method).toBe('GET');

    request.flush([testProduct]);

    expect(service.products()).toEqual([testProduct]);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('should keep demo products when the API returns an empty list', () => {
    const initialProducts = service.products();

    service.loadProducts();

    const request = controller.expectOne('/api/v1/products');
    request.flush([]);

    expect(service.products()).toEqual(initialProducts);
    expect(service.loading()).toBe(false);
  });

  it('should show an error message when loading products fails', () => {
    service.loadProducts();

    const request = controller.expectOne('/api/v1/products');
    request.error(new ProgressEvent('Network error'));

    expect(service.loading()).toBe(false);
    expect(service.error()).toContain('catálogo de demostración');
  });

  it('should search products using a normalized search term', () => {
    service.searchProducts('  CROQUETAS  ').subscribe();

    const request = controller.expectOne(
      req =>
        req.url === '/api/v1/products/search' &&
        req.params.get('q') === 'croquetas'
    );

    expect(request.request.method).toBe('GET');

    request.flush([testProduct]);

    expect(service.searchResults()).toEqual([testProduct]);
    expect(service.searching()).toBe(false);
    expect(service.getCachedSearch(' CROQUETAS ')).toEqual([testProduct]);
  });

  it('should return cached search results when available', () => {
    service.searchProducts('croquetas').subscribe();

    const request = controller.expectOne(
      req => req.url === '/api/v1/products/search'
    );

    request.flush([testProduct]);

    service.searchProducts('croquetas').subscribe(result => {
      expect(result).toEqual([testProduct]);
    });

    const secondRequest = controller.expectOne(
      req => req.url === '/api/v1/products/search'
    );

    secondRequest.flush([testProduct]);

    expect(service.searchResults()).toEqual([testProduct]);
  });

  it('should return an empty result when a search fails without cache', () => {
    service.searchProducts('inexistente').subscribe(result => {
      expect(result).toEqual([]);
    });

    const request = controller.expectOne(
      req => req.url === '/api/v1/products/search'
    );

    request.flush(
      { message: 'Error del servidor' },
      { status: 500, statusText: 'Server Error' }
    );

    expect(service.searchResults()).toEqual([]);
    expect(service.searching()).toBe(false);
  });

  it('should clear search results', () => {
    service.searchResults.set([testProduct]);

    service.clearSearch();

    expect(service.searchResults()).toBeNull();
  });

  it('should find a product by its identifier', () => {
    expect(service.getProductById(1)?.id).toBe(1);
    expect(service.getProductById(9999)).toBeUndefined();
  });

  it('should calculate product categories without duplicates', () => {
    const categories = service.categories();

    expect(categories).toContain('Alimento para perros');
    expect(categories).toContain('Higiene');
    expect(new Set(categories).size).toBe(categories.length);
  });

  it('should add a product after successful creation', () => {
    const requestBody = {
      name: 'Nuevo alimento',
      description: 'Alimento de prueba',
      category: 'Alimento para perros',
      price: 30000,
      stock: 5
    };

    let result: unknown;

    service.createProduct(requestBody).subscribe(response => {
      result = response;
    });

    const request = controller.expectOne('/api/v1/products');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(requestBody);

    request.flush(testProduct);

    expect(result).toEqual({
      status: 'synced',
      product: testProduct
    });

    expect(service.products()).toContain(testProduct);
  });

  it('should add a product received from offline synchronization', () => {
    syncSubject.next(testProduct);

    expect(service.products()).toContain(testProduct);
  });
});
