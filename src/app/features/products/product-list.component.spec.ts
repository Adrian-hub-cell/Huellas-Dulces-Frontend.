
import { signal } from '@angular/core';
import { render, screen, fireEvent, waitFor } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';

import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../models/product.model';

describe('ProductListComponent', () => {
  const products: Product[] = [
    {
      id: 1,
      name: 'Croquetas para perro',
      description: 'Alimento para perros adultos',
      category: 'Alimento para perros',
      price: 45000,
      stock: 20,
      available: true
    },
    {
      id: 2,
      name: 'Galletas caninas',
      description: 'Snacks para perros',
      category: 'Snacks',
      price: 12000,
      stock: 15,
      available: true
    },
    {
      id: 3,
      name: 'Shampoo para mascotas',
      description: 'Producto de higiene',
      category: 'Higiene',
      price: 25000,
      stock: 10,
      available: true
    },
    {
      id: 4,
      name: 'Pelota para perros',
      description: 'Juguete resistente',
      category: 'Juguetes',
      price: 18000,
      stock: 8,
      available: true
    }
  ];

  const productState = signal<Product[]>(products);
  const searchResults = signal<Product[]>([]);
  const loading = signal(false);
  const searching = signal(false);

  const productServiceMock = {
    products: productState,
    searchResults,
    loading,
    searching,
    loadProducts: vi.fn(),
    clearSearch: vi.fn(() => searchResults.set([])),
    searchProducts: vi.fn((term: string) => {
      const normalized = term.toLowerCase();
      const results = products.filter(product =>
        product.name.toLowerCase().includes(normalized)
      );

      searchResults.set(results);
      return of(results);
    }),
    getCachedSearch: vi.fn(() => undefined)
  };

  beforeEach(() => {
    vi.clearAllMocks();
    productState.set(products);
    searchResults.set([]);
    loading.set(false);
    searching.set(false);

    Object.defineProperty(window, 'scrollTo', {
      configurable: true,
      value: vi.fn()
    });
  });

  async function setup() {
    return render(ProductListComponent, {
      providers: [
        provideRouter([]),
        { provide: ProductService, useValue: productServiceMock }
      ]
    });
  }

  it('debe crear el componente y cargar los productos', async () => {
    const { fixture } = await setup();

    expect(fixture.componentInstance).toBeTruthy();
    expect(productServiceMock.loadProducts).toHaveBeenCalledOnce();
    expect(fixture.componentInstance.currentView()).toBe('home');
  });

  it('debe mostrar el catálogo al pulsar Ver todos los productos', async () => {
    const { fixture } = await setup();

    fireEvent.click(
      screen.getByRole('button', { name: /Ver todos los productos/ })
    );

    expect(fixture.componentInstance.currentView()).toBe('catalog');
    expect(fixture.componentInstance.selectedCategory()).toBe('Todas');
    expect(screen.getByRole('searchbox')).toBeTruthy();
  });

  it('debe filtrar los productos al seleccionar una categoría', async () => {
    const { fixture } = await setup();

    const snacksButton = screen.getByRole('button', { name: /Snacks/ });
    fireEvent.click(snacksButton);

    expect(fixture.componentInstance.currentView()).toBe('catalog');
    expect(fixture.componentInstance.selectedCategory()).toBe('Snacks');
    expect(fixture.componentInstance.filteredProducts()).toHaveLength(1);
    expect(fixture.componentInstance.filteredProducts()[0].name)
      .toBe('Galletas caninas');
  });

  it('debe ejecutar la búsqueda después del tiempo de espera', async () => {
    const { fixture } = await setup();

    fireEvent.click(
      screen.getByRole('button', { name: /Ver todos los productos/ })
    );

    const searchInput = screen.getByRole('searchbox');

    fireEvent.input(searchInput, {
      target: { value: 'croquetas' }
    });

    expect(fixture.componentInstance.searchInput()).toBe('croquetas');

    await waitFor(() => {
      expect(productServiceMock.searchProducts)
        .toHaveBeenCalledWith('croquetas');
    }, { timeout: 1500 });

    expect(fixture.componentInstance.filteredProducts()).toHaveLength(1);
    expect(fixture.componentInstance.filteredProducts()[0].name)
      .toBe('Croquetas para perro');
  });

  it('debe limpiar la búsqueda y recuperar todos los productos', async () => {
    const { fixture } = await setup();

    fireEvent.click(
      screen.getByRole('button', { name: /Ver todos los productos/ })
    );

    const searchInput = screen.getByRole('searchbox');

    fireEvent.input(searchInput, {
      target: { value: 'croquetas' }
    });

    await waitFor(() => {
      expect(productServiceMock.searchProducts)
        .toHaveBeenCalledWith('croquetas');
    }, { timeout: 1500 });

    fireEvent.click(
      screen.getByRole('button', { name: /Limpiar búsqueda/ })
    );

    expect(fixture.componentInstance.searchInput()).toBe('');
    expect(productServiceMock.clearSearch).toHaveBeenCalled();
  });
});
