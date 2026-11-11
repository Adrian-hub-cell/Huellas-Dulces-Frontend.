
import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { OfflineSyncService } from './offline-sync.service';
import { OfflineQueueService } from './offline-queue.service';
import { Product, ProductRequest } from '../../models/product.model';

describe('OfflineSyncService', () => {
  let service: OfflineSyncService;
  let queue: OfflineQueueService;
  let httpMock: HttpTestingController;

  const originalOnlineDescriptor =
    Object.getOwnPropertyDescriptor(navigator, 'onLine');

  const productRequest: ProductRequest = {
    name: 'Croquetas para perro',
    description: 'Alimento para perros adultos',
    price: 45000,
    stock: 10,
    category: 'Alimentos'
  };

  const productResponse = {
    id: 1,
    name: 'Croquetas para perro',
    description: 'Alimento para perros adultos',
    price: 45000,
    stock: 10,
    category: 'Alimentos'
  } as Product;

  function setOnline(value: boolean): void {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value
    });
  }

  function initializeService(): void {
    service = TestBed.inject(OfflineSyncService);
  }

  beforeEach(() => {
    localStorage.clear();
    setOnline(false);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        OfflineQueueService,
        OfflineSyncService
      ]
    });

    queue = TestBed.inject(OfflineQueueService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();

    if (originalOnlineDescriptor) {
      Object.defineProperty(
        navigator,
        'onLine',
        originalOnlineDescriptor
      );
    }
  });

  it('debe crear el servicio', () => {
    initializeService();

    expect(service).toBeTruthy();
  });

  it('debe iniciar sin estar sincronizando', () => {
    initializeService();

    expect(service.syncing()).toBe(false);
  });

  it('debe iniciar sin fecha de última sincronización', () => {
    initializeService();

    expect(service.lastSync()).toBeNull();
  });

  it('no debe sincronizar cuando no hay conexión', () => {
    queue.enqueue(productRequest);
    initializeService();

    service.syncQueue();

    expect(service.syncing()).toBe(false);
    expect(queue.pendingCount()).toBe(1);
    httpMock.expectNone('/api/v1/products');
  });

  it('no debe sincronizar cuando la cola está vacía', () => {
    setOnline(true);
    initializeService();

    service.syncQueue();

    expect(service.syncing()).toBe(false);
    httpMock.expectNone('/api/v1/products');
  });

  it('debe iniciar la sincronización cuando hay conexión y productos pendientes', () => {
    setOnline(true);
    queue.enqueue(productRequest);
    initializeService();

    service.syncQueue();

    expect(service.syncing()).toBe(true);

    const request = httpMock.expectOne('/api/v1/products');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(productRequest);

    request.flush(productResponse);

    expect(service.syncing()).toBe(false);
  });

  it('debe eliminar de la cola un producto sincronizado correctamente', () => {
    setOnline(true);
    queue.enqueue(productRequest);
    initializeService();

    service.syncQueue();

    httpMock.expectOne('/api/v1/products').flush(productResponse);

    expect(queue.pendingCount()).toBe(0);
    expect(queue.pendingProducts()).toEqual([]);
  });

  it('debe emitir el producto cuando la sincronización termina correctamente', () => {
    setOnline(true);
    queue.enqueue(productRequest);
    initializeService();

    let emittedProduct: Product | undefined;

    service.syncCompleted$.subscribe(product => {
      emittedProduct = product;
    });

    service.syncQueue();

    httpMock.expectOne('/api/v1/products').flush(productResponse);

    expect(emittedProduct).toEqual(productResponse);
  });

  it('debe registrar la fecha de la última sincronización', () => {
    setOnline(true);
    queue.enqueue(productRequest);
    initializeService();

    service.syncQueue();

    httpMock.expectOne('/api/v1/products').flush(productResponse);

    expect(service.lastSync()).toBeInstanceOf(Date);
  });

  it('debe desactivar el indicador al finalizar la sincronización', () => {
    setOnline(true);
    queue.enqueue(productRequest);
    initializeService();

    service.syncQueue();

    expect(service.syncing()).toBe(true);

    httpMock.expectOne('/api/v1/products').flush(productResponse);

    expect(service.syncing()).toBe(false);
  });

  it('no debe iniciar otra sincronización mientras ya existe una activa', () => {
    setOnline(true);
    queue.enqueue(productRequest);
    initializeService();

    service.syncQueue();
    service.syncQueue();

    expect(service.syncing()).toBe(true);

    const requests = httpMock.match('/api/v1/products');
    expect(requests).toHaveLength(1);

    requests[0].flush(productResponse);

    expect(service.syncing()).toBe(false);
  });

  it('debe continuar con los siguientes productos si una petición falla', () => {
    setOnline(true);

    queue.enqueue(productRequest);
    queue.enqueue({
      ...productRequest,
      name: 'Juguete para perro'
    });

    initializeService();
    service.syncQueue();

    const firstRequest = httpMock.expectOne('/api/v1/products');

    firstRequest.flush(
      { message: 'Error del servidor' },
      { status: 500, statusText: 'Internal Server Error' }
    );

    const secondRequest = httpMock.expectOne('/api/v1/products');

    expect(secondRequest.request.body.name).toBe('Juguete para perro');

    secondRequest.flush({
      ...productResponse,
      id: 2,
      name: 'Juguete para perro'
    } as Product);

    expect(queue.pendingCount()).toBe(1);
    expect(queue.pendingProducts()[0].request.name).toBe(
      'Croquetas para perro'
    );
    expect(service.syncing()).toBe(false);
  });

  it('debe conservar el producto pendiente si el servidor devuelve un error', () => {
    setOnline(true);
    queue.enqueue(productRequest);
    initializeService();

    service.syncQueue();

    httpMock.expectOne('/api/v1/products').flush(
      { message: 'Error del servidor' },
      { status: 500, statusText: 'Internal Server Error' }
    );

    expect(queue.pendingCount()).toBe(1);
    expect(service.lastSync()).toBeNull();
    expect(service.syncing()).toBe(false);
  });

  it('debe sincronizar los productos pendientes uno por uno', () => {
    setOnline(true);

    queue.enqueue(productRequest);
    queue.enqueue({
      ...productRequest,
      name: 'Juguete para perro'
    });

    initializeService();
    service.syncQueue();

    const firstRequest = httpMock.expectOne('/api/v1/products');
    expect(firstRequest.request.body.name).toBe('Croquetas para perro');

    firstRequest.flush(productResponse);

    const secondRequest = httpMock.expectOne('/api/v1/products');
    expect(secondRequest.request.body.name).toBe('Juguete para perro');

    secondRequest.flush({
      ...productResponse,
      id: 2,
      name: 'Juguete para perro'
    } as Product);

    expect(queue.pendingCount()).toBe(0);
    expect(service.syncing()).toBe(false);
  });
});
