import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Product, ProductRequest } from '../../models/product.model';

const DEMO_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Croquetas para perro adulto',
    description: 'Alimento completo para perros adultos.',
    category: 'Alimento para perros',
    price: 25000, stock: 15, available: true
  },
  {
    id: 2,
    name: 'Arena sanitaria para gatos',
    description: 'Arena absorbente para mantener limpio su espacio.',
    category: 'Higiene',
    price: 18000, stock: 8, available: true
  },
  {
    id: 3,
    name: 'Galletas saludables',
    description: 'Deliciosos premios para consentir a tu mascota.',
    category: 'Snacks',
    price: 12000, stock: 0, available: false
  },
  {
    id: 4,
    name: 'Alimento premium para gatos',
    description: 'Nutrición balanceada para gatos adultos.',
    category: 'Alimento para gatos',
    price: 32000, stock: 12, available: true
  },
  {
    id: 5,
    name: 'Snack dental para perros',
    description: 'Premios masticables para el cuidado dental.',
    category: 'Snacks',
    price: 9500, stock: 20, available: true
  },
  {
    id: 6,
    name: 'Shampoo de avena',
    description: 'Limpieza suave para el pelaje de tu mascota.',
    category: 'Higiene',
    price: 16000, stock: 9, available: true
  },
  {
    id: 7,
    name: 'Juguete de cuerda',
    description: 'Ideal para jugar, morder y compartir.',
    category: 'Juguetes',
    price: 14000, stock: 14, available: true
  },
  {
    id: 8,
    name: 'Cama acolchada',
    description: 'Un lugar cómodo para el descanso de tu compañero.',
    category: 'Accesorios',
    price: 85000, stock: 4, available: true
  },
  {
    id: 9,
    name: 'Collar ajustable',
    description: 'Collar resistente y cómodo para paseos.',
    category: 'Accesorios',
    price: 22000, stock: 7, available: true
  },
  {
    id: 10,
    name: 'Plato doble antideslizante',
    description: 'Dos recipientes prácticos para comida y agua.',
    category: 'Accesorios',
    price: 28000, stock: 6, available: true
  },
  {
    id: 11,
    name: 'Pechera reflectiva',
    description: 'Arnés ajustable para paseos más cómodos.',
    category: 'Accesorios',
    price: 35000, stock: 5, available: true
  },
  {
    id: 12,
    name: 'Tapete absorbente',
    description: 'Ayuda a mantener limpios los espacios de tu mascota.',
    category: 'Higiene',
    price: 21000, stock: 11, available: true
  },
  {
    id: 13,
    name: 'Croquetas para cachorro',
    description: 'Alimento pensado para la etapa de crecimiento.',
    category: 'Alimento para perros',
    price: 29000, stock: 13, available: true
  },
  {
    id: 14,
    name: 'Comida húmeda para gato',
    description: 'Textura suave y sabor delicioso para gatos.',
    category: 'Alimento para gatos',
    price: 8500, stock: 18, available: true
  },
  {
    id: 15,
    name: 'Cepillo para mascotas',
    description: 'Ayuda a retirar el pelo suelto y cuidar el pelaje.',
    category: 'Higiene',
    price: 12500, stock: 10, available: true
  },
  {
    id: 16,
    name: 'Comida húmeda para perro',
    description: 'Alimento húmedo delicioso para consentir a tu perro.',
    category: 'Alimento para perros',
    price: 18500, stock: 10, available: true
  },

  // Nuevos alimentos para perros
  {
    id: 17,
    name: 'Croquetas para perro pequeño',
    description: 'Alimento seco presentado para perros de tamaño pequeño.',
    category: 'Alimento para perros',
    price: 27000, stock: 10, available: true
  },
  {
    id: 18,
    name: 'Croquetas para perro mediano',
    description: 'Opción de alimento seco para perros de tamaño mediano.',
    category: 'Alimento para perros',
    price: 31000, stock: 12, available: true
  },
  {
    id: 19,
    name: 'Croquetas para perro grande',
    description: 'Opción de alimento seco para perros de tamaño grande.',
    category: 'Alimento para perros',
    price: 39000, stock: 8, available: true
  },

  // Nuevos alimentos para gatos
  {
    id: 20,
    name: 'Alimento para gatitos',
    description: 'Alimento presentado para la etapa de crecimiento de los gatos.',
    category: 'Alimento para gatos',
    price: 26000, stock: 9, available: true
  },
  {
    id: 21,
    name: 'Alimento para gatos adultos',
    description: 'Alimento seco para gatos en etapa adulta.',
    category: 'Alimento para gatos',
    price: 34000, stock: 11, available: true
  },

  // Nuevos juguetes para perros
  {
    id: 22,
    name: 'Pelota resistente para perros',
    description: 'Pelota para juegos de lanzamiento y búsqueda.',
    category: 'Juguetes',
    price: 11000, stock: 15, available: true
  },
  {
    id: 23,
    name: 'Mordedor de goma para perros',
    description: 'Juguete de goma para actividades de mordida.',
    category: 'Juguetes',
    price: 17000, stock: 10, available: true
  },
  {
    id: 24,
    name: 'Peluche para perros',
    description: 'Compañero de juego suave para tu perro.',
    category: 'Juguetes',
    price: 19000, stock: 8, available: true
  },
  {
    id: 25,
    name: 'Juguete dispensador de premios',
    description: 'Juguete interactivo para esconder pequeños premios.',
    category: 'Juguetes',
    price: 23000, stock: 7, available: true
  },

  // Nuevos juguetes para gatos
  {
    id: 26,
    name: 'Ratón de juguete para gatos',
    description: 'Pequeño juguete para estimular el juego y la exploración.',
    category: 'Juguetes',
    price: 7000, stock: 18, available: true
  },
  {
    id: 27,
    name: 'Caña con plumas para gatos',
    description: 'Juguete para compartir momentos de juego con tu gato.',
    category: 'Juguetes',
    price: 13000, stock: 12, available: true
  },
  {
    id: 28,
    name: 'Pelotas con cascabel para gatos',
    description: 'Pelotas ligeras con sonido para estimular el juego.',
    category: 'Juguetes',
    price: 9000, stock: 20, available: true
  },
  {
    id: 29,
    name: 'Túnel recreativo para gatos',
    description: 'Espacio de exploración y escondite para gatos.',
    category: 'Juguetes',
    price: 32000, stock: 5, available: true
  },
  {
    id: 30,
    name: 'Rascador para gatos',
    description: 'Accesorio para rascar, jugar y explorar.',
    category: 'Accesorios',
    price: 45000, stock: 6, available: true
  },
  {
    id: 31,
    name: 'Fuente de agua para mascotas',
    description: 'Accesorio para ofrecer agua en un recipiente tipo fuente.',
    category: 'Accesorios',
    price: 55000, stock: 4, available: true
  }
];

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);

  private readonly productState = signal<Product[]>(DEMO_PRODUCTS);

  readonly products = this.productState.asReadonly();
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly categories = computed(() =>
    [...new Set(this.products().map(product => product.category))]
  );

  loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<Product[]>('/api/v1/products').subscribe({
      next: products => {
        // El inventario real del servidor tiene prioridad.
        // El catálogo de demostración se conserva como alternativa.
        if (products.length > 0) {
          this.productState.set(products);
        }

        this.loading.set(false);
      },
      error: () => {
        this.error.set(
          'Estás viendo el catálogo de demostración. El inventario del servidor no está disponible.'
        );
        this.loading.set(false);
      }
    });
  }

  getProductById(id: number): Product | undefined {
    return this.products().find(product => product.id === id);
  }

  createProduct(request: ProductRequest): Observable<Product> {
    return this.http.post<Product>('/api/v1/products', request).pipe(
      tap(product => {
        this.productState.update(current => [...current, product]);
      })
    );
  }
}
