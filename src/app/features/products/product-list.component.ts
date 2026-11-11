

import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Product } from '../../models/product.model';
import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/product-card.component';

type CategoryKey =
  | 'Comida'
  | 'Snacks'
  | 'Juguetes'
  | 'Aseo'
  | 'Accesorios';

type PageView = 'home' | 'catalog' | 'calculator';

interface CategoryCard {
  key: CategoryKey;
  title: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-product-list',
  imports: [ProductCardComponent, DecimalPipe],
  template: `
    @if (currentView() === 'home') {
      <section class="home-banner">
        <div class="banner-side">
          <svg class="banner-paw" viewBox="0 0 100 100" aria-hidden="true">
            <ellipse cx="23" cy="38" rx="10" ry="15" transform="rotate(-25 23 38)" fill="currentColor"/>
            <ellipse cx="43" cy="22" rx="10" ry="15" transform="rotate(-8 43 22)" fill="currentColor"/>
            <ellipse cx="65" cy="23" rx="10" ry="15" transform="rotate(12 65 23)" fill="currentColor"/>
            <ellipse cx="83" cy="42" rx="10" ry="15" transform="rotate(28 83 42)" fill="currentColor"/>
            <path d="M50 42 C39 42 30 55 29 67 C28 80 38 85 49 79 C55 76 59 76 65 80 C77 87 88 78 83 65 C79 53 64 42 50 42Z" fill="currentColor"/>
          </svg>
          <span class="banner-word">BIENESTAR</span>
        </div>

        <img
          src="/banner-huellas-dulces.png"
          alt="Huellas Dulces: amor para tus mascotas, salud, comida y accesorios elegantes"
          fetchpriority="high">

        <div class="banner-side">
          <svg class="banner-paw" viewBox="0 0 100 100" aria-hidden="true">
            <ellipse cx="23" cy="38" rx="10" ry="15" transform="rotate(-25 23 38)" fill="currentColor"/>
            <ellipse cx="43" cy="22" rx="10" ry="15" transform="rotate(-8 43 22)" fill="currentColor"/>
            <ellipse cx="65" cy="23" rx="10" ry="15" transform="rotate(12 65 23)" fill="currentColor"/>
            <ellipse cx="83" cy="42" rx="10" ry="15" transform="rotate(28 83 42)" fill="currentColor"/>
            <path d="M50 42 C39 42 30 55 29 67 C28 80 38 85 49 79 C55 76 59 76 65 80 C77 87 88 78 83 65 C79 53 64 42 50 42Z" fill="currentColor"/>
          </svg>
          <span class="banner-word">SALUD</span>
        </div>
      </section>

      <section class="home-categories">
        <div class="category-section-heading">
          <div>
            <span class="eyebrow">EXPLORA HUELLAS DULCES</span>
            <h2>¿Qué necesita tu mascota?</h2>
            <p>Elige una sección y descubre todo lo que tenemos para ti.</p>
          </div>

          <button
            class="all-categories-button"
            type="button"
            (click)="showAllProducts()">
            Ver todos los productos
          </button>
        </div>

        <div class="home-category-grid">
          @for (card of categoryCards; track card.key) {
            <button
              type="button"
              class="home-category-card"
              (click)="selectCategory(card.key)">

              <div class="home-category-image">
                <img
                  [src]="card.image"
                  [alt]="'Productos de ' + card.title"
                  loading="lazy">
                <span class="category-arrow">↗</span>
              </div>

              <div class="home-category-copy">
                <strong>{{ card.title }}</strong>
                <span>{{ card.description }}</span>
                <small>{{ categoryCount(card.key) }} productos</small>
                <span class="category-open-label">
                  Abrir catálogo →
                </span>
              </div>
            </button>
          }

          <button
            type="button"
            class="home-category-card feeding-category-card"
            (click)="openCalculator()">

            <div class="home-category-image feeding-category-image">
              <span class="feeding-card-icon">🐾</span>
              <span class="category-arrow">↗</span>
            </div>

            <div class="home-category-copy">
              <strong>Alimentación</strong>
              <span>Calcula la porción diaria de tu mascota</span>
              <small>Calculadora gratuita</small>
              <span class="category-open-label">
                Abrir calculadora →
              </span>
            </div>
          </button>
        </div>
      </section>
    }

    @if (currentView() === 'calculator') {
      <section class="feeding-calculator">
        <button
          class="all-categories-button"
          type="button"
          (click)="backToHome()">
          ← Volver al inicio
        </button>

        <div class="feeding-heading">
          <span class="eyebrow">🐶🐱 HUELLAS DULCES TE AYUDA</span>
          <h2>¿Cuánta porción necesita tu mascota?</h2>
          <p>
            Calcula cuánto alimento debes servir en cada comida
            usando la cantidad diaria recomendada en el empaque.
          </p>
        </div>

        <div class="feeding-form">
          <label>
            ¿Qué mascota tienes?
            <select
              [value]="petSpecies()"
              (change)="updateSpecies($event)">
              <option value="Perro">🐶 Perro</option>
              <option value="Gato">🐱 Gato</option>
            </select>
          </label>

          <label>
            ¿Cuántas comidas recibe al día?
            <select
              [value]="mealsPerDay()"
              (change)="updateMeals($event)">
              <option value="1">1 comida</option>
              <option value="2">2 comidas</option>
              <option value="3">3 comidas</option>
              <option value="4">4 comidas</option>
            </select>
          </label>

          <label class="feeding-ration-field">
            ¿Cuántos gramos debe comer al día según el empaque?
            <input
              type="number"
              min="0.1"
              step="0.1"
              placeholder="Ej. 180"
              [value]="dailyRation() ?? ''"
              (input)="updateDailyRation($event)">
            <small>
              Consulta la tabla de alimentación del producto.
            </small>
          </label>
        </div>

        @if (calculatedPortion(); as portion) {
          <div class="feeding-result" aria-live="polite">
            <span>TOTAL DE ALIMENTO AL DÍA</span>
            <strong>{{ portion.daily | number:'1.0-1' }} g</strong>
            <p>
              Reparte esta cantidad entre {{ mealsPerDay() }} comidas.
            </p>

            <div class="feeding-per-meal">
              <span>Cantidad que debes servir en cada comida</span>
              <strong>{{ portion.perMeal | number:'1.0-1' }} g</strong>
            </div>
          </div>
        } @else {
          <div class="feeding-instructions">
            <strong>¡Vamos a calcular su porción! 🐾</strong>
            <p>
              Escribe los gramos diarios que indica el empaque
              y selecciona cuántas comidas recibe tu mascota.
            </p>
          </div>
        }

        <p class="feeding-disclaimer">
          Esta herramienta únicamente divide la ración indicada
          por el fabricante. No determina las necesidades nutricionales
          de tu mascota ni sustituye una recomendación veterinaria.
        </p>
      </section>
    }

    @if (currentView() === 'catalog') {
      <section class="catalog-section" id="catalog-results">
        <button
          class="all-categories-button"
          type="button"
          (click)="backToHome()">
          ← Volver al inicio
        </button>

        <div class="section-heading">
          <div>
            <span class="eyebrow">HUELLAS DULCES</span>
            <h2>
              {{ selectedCategory() === 'Todas'
                ? 'Todos nuestros productos'
                : 'Catálogo de ' + selectedCategory() }}
            </h2>
            <p>
              Descubre nuestros productos y encuentra el indicado
              para tu mascota.
            </p>
          </div>

          <span class="results-count">
            {{ filteredProducts().length }} productos
          </span>
        </div>

        <label class="search-box">
          <span>⌕</span>
          <input
            type="search"
            placeholder="Busca el producto que necesitas..."
            [value]="searchInput()"
            (input)="updateSearch($event)"
            aria-label="Buscar productos">
        </label>

        @if (searchInput()) {
          <div class="active-filter-bar">
            <span>Resultados de tu búsqueda</span>
            <button type="button" (click)="clearSearch()">
              Limpiar búsqueda ×
            </button>
          </div>
        }

        @if (productService.searching()) {
          <p class="empty-state" aria-live="polite">Actualizando resultados...</p>
        }

        @if (productService.loading()) {
          <p class="empty-state">Cargando productos...</p>
        } @else {
          <div class="product-grid">
            @for (product of filteredProducts(); track product.id) {
              <app-product-card
                [product]="product"
                (selected)="openProduct($event)" />
            } @empty {
              <div class="empty-state">
                <h3>No encontramos productos</h3>
                <p>
                  Prueba con otra búsqueda o regresa al inicio.
                </p>
                <button
                  class="secondary-button reset-button"
                  type="button"
                  (click)="backToHome()">
                  Volver al inicio
                </button>
              </div>
            }
          </div>
        }
      </section>
    }
  `
})
export class ProductListComponent {
  readonly productService = inject(ProductService);
  private readonly router = inject(Router);

  readonly currentView = signal<PageView>('home');
  readonly searchInput = signal('');
  readonly selectedCategory = signal<string>('Todas');

  readonly petSpecies = signal('Perro');
  readonly dailyRation = signal<number | null>(null);
  readonly mealsPerDay = signal(2);

  readonly calculatedPortion = computed(() => {
    const daily = this.dailyRation();
    const meals = this.mealsPerDay();

    if (daily === null || daily <= 0 || meals <= 0) {
      return null;
    }

    return {
      daily,
      perMeal: daily / meals
    };
  });

  readonly categoryCards: CategoryCard[] = [
    {
      key: 'Comida',
      title: 'Comida',
      description: 'Alimentos para perros y gatos',
      image: '/products/croquetas-perro.jpg'
    },
    {
      key: 'Snacks',
      title: 'Snacks',
      description: 'Premios para consentirlos',
      image: '/products/galletas.png'
    },
    {
      key: 'Juguetes',
      title: 'Juguetes',
      description: 'Diversión para perros y gatos',
      image: '/products/pelota-perros.jpg'
    },
    {
      key: 'Aseo',
      title: 'Aseo',
      description: 'Limpieza y cuidado de tu mascota',
      image: '/products/shampoo.jpg'
    },
    {
      key: 'Accesorios',
      title: 'Accesorios',
      description: 'Artículos para acompañarlos',
      image: '/products/collar.jpg'
    }
  ];

  private readonly searchTerms = new Subject<string>();

  readonly filteredProducts = computed(() => {
    const term = this.searchInput().trim();
    const category = this.selectedCategory();

    // Si hay búsqueda, se muestran los resultados del servidor o de la caché.
    const source = term
      ? (this.productService.searchResults() ?? [])
      : this.productService.products();

    return source.filter(product =>
      this.matchesCategory(product, category)
    );
  });

  constructor() {
    this.productService.loadProducts();

    // Búsqueda reactiva: espera 300 ms y cancela consultas anteriores.
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term) {
          this.productService.clearSearch();
          return of([]);
        }

        return this.productService.searchProducts(term);
      }),
      takeUntilDestroyed()
    ).subscribe();
  }

  private matchesCategory(product: Product, category: string): boolean {
    const productCategory = product.category.toLocaleLowerCase();

    if (category === 'Todas') return true;

    if (category === 'Comida') {
      return productCategory.includes('alimento para perros') ||
        productCategory.includes('alimento para gatos');
    }

    if (category === 'Aseo') {
      return productCategory === 'higiene';
    }

    return productCategory === category.toLocaleLowerCase();
  }

  categoryCount(category: CategoryKey): number {
    return this.productService.products().filter(
      product => this.matchesCategory(product, category)
    ).length;
  }

  selectCategory(category: CategoryKey): void {
    this.selectedCategory.set(category);
    this.searchInput.set('');
    this.productService.clearSearch();
    this.searchTerms.next('');
    this.currentView.set('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showAllProducts(): void {
    this.selectedCategory.set('Todas');
    this.searchInput.set('');
    this.productService.clearSearch();
    this.searchTerms.next('');
    this.currentView.set('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openCalculator(): void {
    this.currentView.set('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToHome(): void {
    this.currentView.set('home');
    this.selectedCategory.set('Todas');
    this.searchInput.set('');
    this.productService.clearSearch();
    this.searchTerms.next('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateSpecies(event: Event): void {
    this.petSpecies.set((event.target as HTMLSelectElement).value);
  }

  updateMeals(event: Event): void {
    this.mealsPerDay.set(
      Number((event.target as HTMLSelectElement).value)
    );
  }

  updateDailyRation(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.dailyRation.set(value > 0 ? value : null);
  }

  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const term = input.value;

    this.searchInput.set(term);

    if (!term.trim()) {
      this.productService.clearSearch();
    } else {
      // Mostrar primero la caché disponible mientras llega la respuesta nueva.
      const cached = this.productService.getCachedSearch(term);
      this.productService.searchResults.set(cached ?? []);
    }

    this.searchTerms.next(term.trim());
  }

  clearSearch(): void {
    this.searchInput.set('');
    this.productService.clearSearch();
    this.searchTerms.next('');
  }

  openProduct(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }
}



