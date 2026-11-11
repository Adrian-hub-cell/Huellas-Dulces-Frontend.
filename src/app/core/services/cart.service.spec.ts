
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';

import { CartService } from './cart.service';
import { Product } from '../../models/product.model';

describe('CartService', () => {
  let service: CartService;

  const product: Product = {
    id: 1,
    name: 'Croquetas para perro',
    description: 'Alimento para perros adultos',
    category: 'Alimento para perros',
    price: 45000,
    stock: 10,
    available: true
  };

  const anotherProduct: Product = {
    id: 2,
    name: 'Galletas caninas',
    description: 'Snacks para perros',
    category: 'Snacks',
    price: 12000,
    stock: 5,
    available: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CartService]
    });

    service = TestBed.inject(CartService);
  });

  it('debe crear el servicio con el carrito vacío', () => {
    expect(service).toBeTruthy();
    expect(service.items()).toEqual([]);
    expect(service.favorites()).toEqual([]);
    expect(service.count()).toBe(0);
    expect(service.subtotal()).toBe(0);
  });

  it('debe agregar un producto al carrito', () => {
    service.add(product);

    expect(service.items()).toHaveLength(1);
    expect(service.items()[0].product.id).toBe(1);
    expect(service.items()[0].quantity).toBe(1);
  });

  it('debe agregar una cantidad personalizada', () => {
    service.add(product, 3);

    expect(service.items()[0].quantity).toBe(3);
    expect(service.count()).toBe(3);
  });

  it('no debe agregar productos sin stock', () => {
    const unavailable = { ...product, stock: 0 };

    service.add(unavailable);

    expect(service.items()).toHaveLength(0);
  });

  it('no debe agregar cantidades menores o iguales a cero', () => {
    service.add(product, 0);
    service.add(product, -2);

    expect(service.items()).toHaveLength(0);
  });

  it('debe incrementar la cantidad si el producto ya existe', () => {
    service.add(product, 2);
    service.add(product, 3);

    expect(service.items()).toHaveLength(1);
    expect(service.items()[0].quantity).toBe(5);
  });

  it('no debe superar el stock disponible al agregar', () => {
    service.add(product, 8);
    service.add(product, 8);

    expect(service.items()[0].quantity).toBe(10);
  });

  it('debe aumentar la cantidad de un producto', () => {
    service.add(product, 2);

    service.increase(product.id);

    expect(service.items()[0].quantity).toBe(3);
  });

  it('no debe modificar productos inexistentes al aumentar', () => {
    service.increase(999);

    expect(service.items()).toEqual([]);
  });

  it('debe disminuir la cantidad de un producto', () => {
    service.add(product, 3);

    service.decrease(product.id);

    expect(service.items()[0].quantity).toBe(2);
  });

  it('debe eliminar el producto cuando la cantidad disminuye a cero', () => {
    service.add(product, 1);

    service.decrease(product.id);

    expect(service.items()).toEqual([]);
  });

  it('no debe modificar productos inexistentes al disminuir', () => {
    service.decrease(999);

    expect(service.items()).toEqual([]);
  });

  it('debe establecer una cantidad personalizada', () => {
    service.add(product);

    service.setQuantity(product.id, 4);

    expect(service.items()[0].quantity).toBe(4);
  });

  it('debe limitar la cantidad establecida al stock', () => {
    service.add(product);

    service.setQuantity(product.id, 50);

    expect(service.items()[0].quantity).toBe(10);
  });

  it('debe eliminar el producto cuando se establece una cantidad cero', () => {
    service.add(product);

    service.setQuantity(product.id, 0);

    expect(service.items()).toEqual([]);
  });

  it('debe eliminar un producto del carrito', () => {
    service.add(product);
    service.add(anotherProduct);

    service.remove(product.id);

    expect(service.items()).toHaveLength(1);
    expect(service.items()[0].product.id).toBe(2);
  });

  it('debe vaciar completamente el carrito', () => {
    service.add(product);
    service.add(anotherProduct);

    service.clear();

    expect(service.items()).toEqual([]);
    expect(service.count()).toBe(0);
    expect(service.subtotal()).toBe(0);
  });

  it('debe calcular correctamente el total de unidades', () => {
    service.add(product, 2);
    service.add(anotherProduct, 3);

    expect(service.count()).toBe(5);
  });

  it('debe calcular correctamente el subtotal', () => {
    service.add(product, 2);
    service.add(anotherProduct, 3);

    expect(service.subtotal()).toBe(126000);
  });

  it('debe agregar un producto a favoritos', () => {
    service.toggleFavorite(product.id);

    expect(service.favorites()).toContain(product.id);
    expect(service.isFavorite(product.id)).toBe(true);
  });

  it('debe quitar un producto de favoritos al seleccionarlo nuevamente', () => {
    service.toggleFavorite(product.id);
    service.toggleFavorite(product.id);

    expect(service.favorites()).toEqual([]);
    expect(service.isFavorite(product.id)).toBe(false);
  });

  it('debe conservar otros favoritos al quitar uno', () => {
    service.toggleFavorite(product.id);
    service.toggleFavorite(anotherProduct.id);
    service.toggleFavorite(product.id);

    expect(service.favorites()).toEqual([anotherProduct.id]);
  });

  it('debe devolver false cuando un producto no es favorito', () => {
    expect(service.isFavorite(999)).toBe(false);
  });
});
