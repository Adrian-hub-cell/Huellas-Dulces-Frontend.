
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OfflineQueueService } from './offline-queue.service';
import { ProductRequest } from '../../models/product.model';

describe('OfflineQueueService', () => {
  let service: OfflineQueueService;

  const storageKey = 'huellas-dulces-pending-products';

  const productRequest: ProductRequest = {
    name: 'Croquetas para perro',
    description: 'Alimento para perros adultos',
    price: 45000,
    stock: 10,
    category: 'Alimentos'
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [OfflineQueueService]
    });

    service = TestBed.inject(OfflineQueueService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe iniciar con una cola vacía', () => {
    expect(service.pendingProducts()).toEqual([]);
    expect(service.pendingCount()).toBe(0);
  });

  it('debe agregar un producto a la cola offline', () => {
    const result = service.enqueue(productRequest);

    expect(result).toBe(true);
    expect(service.pendingProducts()).toHaveLength(1);
    expect(service.pendingProducts()[0].request).toEqual(productRequest);
  });

  it('debe generar un identificador para el producto pendiente', () => {
    service.enqueue(productRequest);

    expect(service.pendingProducts()[0].id).toBeTruthy();
  });

  it('debe guardar la fecha de creación del producto pendiente', () => {
    service.enqueue(productRequest);

    expect(
      new Date(service.pendingProducts()[0].createdAt).toString()
    ).not.toBe('Invalid Date');
  });

  it('debe actualizar el contador al agregar productos', () => {
    service.enqueue(productRequest);
    service.enqueue(productRequest);

    expect(service.pendingCount()).toBe(2);
  });

  it('debe guardar los productos en localStorage', () => {
    service.enqueue(productRequest);

    const stored = JSON.parse(localStorage.getItem(storageKey) ?? '[]');

    expect(stored).toHaveLength(1);
    expect(stored[0].request).toEqual(productRequest);
  });

  it('debe conservar la cola al consultar los pendientes', () => {
    service.enqueue(productRequest);

    const pending = service.getPending();

    expect(pending).toHaveLength(1);
    expect(service.pendingProducts()).toHaveLength(1);
  });

  it('debe devolver una copia de la cola al consultar los pendientes', () => {
    service.enqueue(productRequest);

    const pending = service.getPending();
    pending.pop();

    expect(service.pendingProducts()).toHaveLength(1);
  });

  it('debe eliminar un producto pendiente por su identificador', () => {
    service.enqueue(productRequest);
    const id = service.pendingProducts()[0].id;

    const result = service.remove(id);

    expect(result).toBe(true);
    expect(service.pendingProducts()).toHaveLength(0);
  });

  it('debe actualizar el contador al eliminar productos', () => {
    service.enqueue(productRequest);
    const id = service.pendingProducts()[0].id;

    service.remove(id);

    expect(service.pendingCount()).toBe(0);
  });

  it('debe actualizar localStorage al eliminar productos', () => {
    service.enqueue(productRequest);
    const id = service.pendingProducts()[0].id;

    service.remove(id);

    expect(JSON.parse(localStorage.getItem(storageKey) ?? '[]')).toEqual([]);
  });

  it('debe conservar otros productos al eliminar uno', () => {
    service.enqueue(productRequest);
    service.enqueue({
      ...productRequest,
      name: 'Juguete para perro'
    });

    const id = service.pendingProducts()[0].id;
    service.remove(id);

    expect(service.pendingProducts()).toHaveLength(1);
    expect(service.pendingProducts()[0].request.name).toBe('Juguete para perro');
  });

  it('debe devolver true al eliminar un identificador inexistente', () => {
    expect(service.remove('no-existe')).toBe(true);
    expect(service.pendingProducts()).toEqual([]);
  });

  it('debe cargar los productos guardados previamente en localStorage', () => {
    const stored = [{
      id: 'producto-1',
      request: productRequest,
      createdAt: '2026-11-11T10:00:00.000Z'
    }];

    localStorage.setItem(storageKey, JSON.stringify(stored));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [OfflineQueueService]
    });

    service = TestBed.inject(OfflineQueueService);

    expect(service.pendingProducts()).toEqual(stored);
    expect(service.pendingCount()).toBe(1);
  });

  it('debe iniciar vacío si localStorage contiene JSON inválido', () => {
    localStorage.setItem(storageKey, '{json incorrecto');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [OfflineQueueService]
    });

    service = TestBed.inject(OfflineQueueService);

    expect(service.pendingProducts()).toEqual([]);
  });

  it('debe iniciar vacío si localStorage contiene un valor que no es un arreglo', () => {
    localStorage.setItem(storageKey, JSON.stringify({ product: productRequest }));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [OfflineQueueService]
    });

    service = TestBed.inject(OfflineQueueService);

    expect(service.pendingProducts()).toEqual([]);
  });

  it('debe devolver una cola vacía si localStorage no contiene datos', () => {
    localStorage.removeItem(storageKey);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [OfflineQueueService]
    });

    service = TestBed.inject(OfflineQueueService);

    expect(service.pendingProducts()).toEqual([]);
  });

  it('debe devolver false si falla el guardado en localStorage', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage lleno');
    });

    expect(service.enqueue(productRequest)).toBe(false);
    expect(service.pendingProducts()).toEqual([]);
    expect(service.pendingCount()).toBe(0);
  });
});
