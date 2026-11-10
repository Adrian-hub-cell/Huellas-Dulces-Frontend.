import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';
import { Product } from '../../models/product.model';
import { productImagePath } from '../../shared/product-image.util';

interface ProductInformation {
  type: string;
  audience: string;
  purpose: string;
  characteristics: string;
  recommendation: string;
  conservation: string;
  note: string;
}

type InfoSection =
  | 'type'
  | 'audience'
  | 'purpose'
  | 'characteristics'
  | 'recommendation'
  | 'conservation';

function getProductInformation(product: Product): ProductInformation {
  const name = product.name.toLocaleLowerCase();

  if (name.includes('croquetas para perro adulto')) {
    return {
      type: 'Alimento seco en croquetas',
      audience: 'Perros adultos',
      purpose: 'Alimentación diaria',
      characteristics: 'Alimento completo para perros adultos, presentado en forma de croquetas.',
      recommendation: 'Ofrece la porción indicada por el fabricante según el peso y las necesidades de tu perro. Mantén siempre agua fresca disponible.',
      conservation: 'Guarda el alimento en un lugar fresco y seco, con el empaque bien cerrado.',
      note: 'El peso neto, los ingredientes, la información nutricional y la ración exacta deben consultarse en el empaque de la marca.'
    };
  }

  if (name.includes('croquetas para cachorro')) {
    return {
      type: 'Alimento seco en croquetas',
      audience: 'Perros cachorros',
      purpose: 'Alimentación durante el crecimiento',
      characteristics: 'Croquetas destinadas a la alimentación de perros en etapa de crecimiento.',
      recommendation: 'Consulta la ración diaria recomendada por el fabricante de acuerdo con la edad y el peso del cachorro.',
      conservation: 'Mantén el producto cerrado y protegido de la humedad.',
      note: 'Verifica en el empaque la edad recomendada, composición y guía de alimentación.'
    };
  }

  if (name.includes('comida húmeda')) {
    return {
      type: 'Alimento húmedo',
      audience: name.includes('perro') ? 'Perros' : 'Gatos',
      purpose: 'Alimentación de mascotas',
      characteristics: 'Presentación húmeda, práctica para servir y almacenar según las indicaciones del fabricante.',
      recommendation: 'Respeta la porción recomendada en el empaque. Una vez abierto, sigue las instrucciones de refrigeración y consumo.',
      conservation: 'Antes de abrir, conserva el producto según las indicaciones del envase. Después de abrir, sigue las instrucciones de refrigeración.',
      note: 'El contenido, peso y composición nutricional dependen de la presentación y marca seleccionadas.'
    };
  }

  if (name.includes('snack') || name.includes('galletas')) {
    return {
      type: 'Premio para mascotas',
      audience: 'Mascotas, según la presentación',
      purpose: 'Premiar y consentir',
      characteristics: 'Producto pensado para ofrecer como premio entre comidas.',
      recommendation: 'Ofrece porciones moderadas y revisa que los ingredientes sean adecuados para tu mascota.',
      conservation: 'Mantén el empaque cerrado y sigue las recomendaciones de conservación.',
      note: 'Consulta los ingredientes, edad recomendada y cantidad diaria indicada por el fabricante.'
    };
  }

  if (name.includes('arena sanitaria')) {
    return {
      type: 'Producto de higiene',
      audience: 'Gatos',
      purpose: 'Higiene del espacio sanitario',
      characteristics: 'Producto para el mantenimiento de la bandeja sanitaria de tu gato.',
      recommendation: 'Mantén limpia la bandeja y realiza el cambio del producto siguiendo las instrucciones del fabricante.',
      conservation: 'Guarda el empaque en un lugar seco y protegido de la humedad.',
      note: 'La composición y capacidad de absorción deben verificarse en el empaque.'
    };
  }

  if (name.includes('shampoo') || name.includes('cepillo') ||
      name.includes('tapete')) {
    return {
      type: 'Accesorio de higiene y cuidado',
      audience: 'Mascotas, según el producto',
      purpose: 'Cuidado e higiene',
      characteristics: 'Producto diseñado para apoyar las rutinas de cuidado de las mascotas.',
      recommendation: 'Utiliza el producto siguiendo sus instrucciones y las características de tu mascota.',
      conservation: 'Conserva el producto limpio y en un espacio adecuado.',
      note: 'Consulta las instrucciones específicas de uso y las recomendaciones del fabricante.'
    };
  }

  return {
    type: 'Accesorio para mascotas',
    audience: 'Mascotas, según tamaño y presentación',
    purpose: 'Bienestar y comodidad',
    characteristics: 'Producto pensado para acompañar las actividades y el cuidado cotidiano de tu mascota.',
    recommendation: 'Verifica que el tamaño y las características sean apropiados para tu mascota antes de utilizarlo.',
    conservation: 'Mantén el producto limpio y revisa periódicamente su estado.',
    note: 'Las medidas, materiales y características específicas deben confirmarse con la presentación del producto.'
  };
}

@Component({
  selector: 'app-product-detail',
  imports: [CurrencyPipe, DecimalPipe, RouterLink],
  template: `
    <a routerLink="/" class="back-link">← Volver al catálogo</a>

    @if (product(); as item) {
      @if (details(); as info) {
        <section class="detail-layout">
          <div class="detail-illustration">
            <img [src]="productImage()"
              [alt]="'Fotografía de ' + item.name">
          </div>

          <div class="detail-content">
            <span class="eyebrow">{{ item.category }}</span>
            <h1>{{ item.name }}</h1>
            <p class="detail-summary">{{ item.description }}</p>

            <strong class="detail-price">
              {{ item.price | currency:'COP':'$':'1.0-0' }}
            </strong>

            <div class="detail-stock">
              <span>Disponibilidad</span>
              <strong [class.out-of-stock]="item.stock === 0">
                {{ item.stock > 0 ? 'Disponible' : 'Agotado' }}
              </strong>
              <span>{{ item.stock }} unidades en inventario</span>
            </div>

            <div class="purchase-controls">
              <span class="quantity-label">Cantidad</span>

              <div class="quantity-selector">
                <button type="button"
                  (click)="decreaseQuantity()"
                  [disabled]="quantity() <= 1">−</button>
                <strong>{{ quantity() }}</strong>
                <button type="button"
                  (click)="increaseQuantity()"
                  [disabled]="quantity() >= item.stock">+</button>
              </div>

              <button type="button"
                class="add-cart-button detail-cart-button"
                [disabled]="item.stock <= 0"
                (click)="addToCart(item)">
                {{ item.stock > 0 ? 'Agregar al carrito' : 'Producto agotado' }}
              </button>

              <button type="button"
                class="detail-favorite-button"
                [class.is-favorite]="cart.isFavorite(item.id)"
                (click)="toggleFavorite(item)">
                {{ cart.isFavorite(item.id) ? '♥ Guardado en favoritos' : '♡ Agregar a favoritos' }}
              </button>
            </div>
          </div>
        </section>

        <section class="interactive-information">
          <div class="interactive-heading">
            <span class="eyebrow">DESCUBRE CADA DETALLE</span>
            <h2>Conoce más sobre este producto</h2>
            <p>Selecciona una de las opciones para descubrir toda la información.</p>
          </div>

          @if (item.category === 'Alimento para perros' || item.category === 'Alimento para gatos') {
            <button type="button" class="feeding-calculator-tile"
              [class.active]="calculatorOpen()"
              [attr.aria-expanded]="calculatorOpen()"
              (click)="calculatorOpen.update(open => !open)">
              <span class="feeding-calculator-art">??</span>
              <span class="feeding-calculator-copy">
                <small>CUIDAMOS SU ALIMENTACI&Oacute;N</small>
                <strong>Calculadora de alimentaci&oacute;n</strong>
                <span>Descubre cu&aacute;nto alimento servirle cada d&iacute;a</span>
              </span>
              <span class="feeding-calculator-arrow">{{ calculatorOpen() ? '-' : '+' }}</span>
            </button>
            @if (calculatorOpen()) {
        <section class="feeding-calculator">
          <button type="button" class="feeding-modal-close" aria-label="Cerrar calculadora" (click)="calculatorOpen.set(false)">×</button>
          <div class="feeding-heading">
            <span class="eyebrow">CUIDAMOS SU ALIMENTACIÓN</span>
            <h2>¿Cuánto alimento necesita tu mascota?</h2>
            <p>Conoce cuánto alimento servirle cada día siguiendo las indicaciones del fabricante.</p>
          </div>

          <div class="feeding-form">
            <label>
              Tipo de mascota
              <select [value]="petSpecies()" (change)="updateSpecies($event)">
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
              </select>
            </label>

            <label>
              Peso de tu mascota (kg)
              <input type="number" min="0.1" step="0.1"
                placeholder="Ej. 8.5"
                [value]="petWeight() ?? ''"
                (input)="updatePetWeight($event)">
            </label>

            <label>
              Tamaño
              <select [value]="petSize()" (change)="updatePetSize($event)">
                <option value="Pequeño">Pequeño</option>
                <option value="Mediano">Mediano</option>
                <option value="Grande">Grande</option>
              </select>
            </label>

            <label>
              Etapa de vida
              <select [value]="petStage()" (change)="updatePetStage($event)">
                <option value="Cachorro o gatito">Cachorro o gatito</option>
                <option value="Adulto">Adulto</option>
                <option value="Senior">Senior</option>
              </select>
            </label>

            <label class="feeding-ration-field">
              Ración diaria indicada en el empaque (gramos)
              <input type="number" min="1" step="1"
                placeholder="Ej. 180"
                [value]="dailyRation() ?? ''"
                (input)="updateDailyRation($event)">
              <small>Busca en la tabla del fabricante la cantidad correspondiente al peso y etapa de tu mascota.</small>
            </label>

            <label>
              Comidas al día
              <select [value]="mealsPerDay()" (change)="updateMeals($event)">
                <option value="1">1 comida</option>
                <option value="2">2 comidas</option>
                <option value="3">3 comidas</option>
                <option value="4">4 comidas</option>
              </select>
            </label>
          </div>

          @if (calculatedPortion(); as portion) {
            <div class="feeding-result" aria-live="polite">
              <span>PORCIÓN DIARIA</span>
              <strong>{{ portion.daily }} g</strong>
              <p>Esta es la cantidad total recomendada por día, distribuida en {{ mealsPerDay() }} comidas.</p>
              <div class="feeding-per-meal">
                <span>Cantidad por comida</span>
                <strong>{{ portion.perMeal | number:'1.0-1' }} g</strong>
              </div>
            </div>
          } @else {
            <div class="feeding-instructions">
              <strong>¡Vamos a conocer su porción ideal!</strong>
              <p>Selecciona el tipo de mascota, indica su peso y etapa de vida. Después, introduce la ración diaria que aparece en el empaque y el número de comidas. ¡Te mostraremos cuánto servir en cada una!</p>
            </div>
          }

          <p class="feeding-disclaimer">
            Esta herramienta divide la ración indicada por el fabricante; no sustituye una recomendación veterinaria. Si el empaque no incluye una guía adecuada para tu mascota, consulta con un veterinario.
          </p>
        </section>            }
          }
          <div class="info-tiles">
            <button type="button" class="info-tile info-type"
              [class.active]="activeInfo() === 'type'"
              [attr.aria-expanded]="activeInfo() === 'type'"
              (click)="toggleInfo('type')">
              <span class="info-art">
                <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
                  <path d="M14 49h72l-9 31H23l-9-31Z" fill="#D5A36D"/>
                  <path d="M19 48h62" stroke="#895D38" stroke-width="5" stroke-linecap="round"/>
                  <circle cx="35" cy="37" r="6" fill="#477B58"/>
                  <circle cx="50" cy="27" r="7" fill="#D98C4D"/>
                  <circle cx="65" cy="37" r="6" fill="#477B58"/>
                  <path d="M22 85h56" stroke="#895D38" stroke-width="5" stroke-linecap="round"/>
                </svg>
              </span>
              <span class="info-tile-copy">
                <small>DESCUBRE</small>
                <strong>Tipo de producto</strong>
                <span>{{ info.type }}</span>
              </span>
              <span class="info-tile-arrow">↗</span>
            </button>

            <button type="button" class="info-tile info-audience"
              [class.active]="activeInfo() === 'audience'"
              [attr.aria-expanded]="activeInfo() === 'audience'"
              (click)="toggleInfo('audience')">
              <span class="info-art">
                <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
                  <path d="M50 78c-9-10-29-18-29-37 0-12 9-19 20-19 5 0 9 3 12 8 4-5 8-8 15-8 11 0 19 8 19 19 0 17-22 29-37 37Z" fill="#D98E87"/>
                  <circle cx="37" cy="46" r="4" fill="#fff"/>
                  <circle cx="63" cy="46" r="4" fill="#fff"/>
                  <path d="M45 57q5 6 10 0" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
                  <path d="M50 10v8M14 45h8M78 45h8" stroke="#B46C68" stroke-width="4" stroke-linecap="round"/>
                </svg>
              </span>
              <span class="info-tile-copy">
                <small>IDEAL PARA</small>
                <strong>¿Para quién es?</strong>
                <span>{{ info.audience }}</span>
              </span>
              <span class="info-tile-arrow">↗</span>
            </button>

            <button type="button" class="info-tile info-purpose"
              [class.active]="activeInfo() === 'purpose'"
              [attr.aria-expanded]="activeInfo() === 'purpose'"
              (click)="toggleInfo('purpose')">
              <span class="info-art">
                <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
                  <path d="M15 47h70l-9 29H24l-9-29Z" fill="#7EA1C4"/>
                  <path d="M22 46h56" stroke="#416A91" stroke-width="5" stroke-linecap="round"/>
                  <path d="m50 12 6 13 14 2-10 10 2 14-12-7-12 7 2-14-10-10 14-2 6-13Z" fill="#F7C66A"/>
                </svg>
              </span>
              <span class="info-tile-copy">
                <small>SU FUNCIÓN</small>
                <strong>Uso principal</strong>
                <span>{{ info.purpose }}</span>
              </span>
              <span class="info-tile-arrow">↗</span>
            </button>

            <button type="button" class="info-tile info-characteristics"
              [class.active]="activeInfo() === 'characteristics'"
              [attr.aria-expanded]="activeInfo() === 'characteristics'"
              (click)="toggleInfo('characteristics')">
              <span class="info-art">
                <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
                  <path d="M50 13 61 35l25 4-18 18 4 25-22-12-22 12 4-25-18-18 25-4 11-22Z" fill="#A98AC2"/>
                  <path d="m39 50 8 8 16-18" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <span class="info-tile-copy">
                <small>LO QUE OFRECE</small>
                <strong>Características</strong>
                <span>Conoce sus detalles</span>
              </span>
              <span class="info-tile-arrow">↗</span>
            </button>

            <button type="button" class="info-tile info-recommendation"
              [class.active]="activeInfo() === 'recommendation'"
              [attr.aria-expanded]="activeInfo() === 'recommendation'"
              (click)="toggleInfo('recommendation')">
              <span class="info-art">
                <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
                  <path d="M30 17h40l-5 17H35l-5-17Z" fill="#E6B35A"/>
                  <path d="M35 34h30l-4 48H39l-4-48Z" fill="#E6B35A"/>
                  <path d="M42 49h16M42 60h16" stroke="#9B6D2D" stroke-width="4" stroke-linecap="round"/>
                  <path d="M50 7v8M22 43l8 8M78 43l-8 8" stroke="#9B6D2D" stroke-width="4" stroke-linecap="round"/>
                </svg>
              </span>
              <span class="info-tile-copy">
                <small>APRENDE A USARLO</small>
                <strong>Recomendaciones</strong>
                <span>Consejos para utilizarlo</span>
              </span>
              <span class="info-tile-arrow">↗</span>
            </button>

            <button type="button" class="info-tile info-conservation"
              [class.active]="activeInfo() === 'conservation'"
              [attr.aria-expanded]="activeInfo() === 'conservation'"
              (click)="toggleInfo('conservation')">
              <span class="info-art">
                <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
                  <path d="M37 14h26v9H37z" fill="#5B9290"/>
                  <path d="M31 23h38l5 62H26l5-62Z" fill="#83B9AE"/>
                  <path d="M36 45h28v23H36z" fill="#E8F3EA"/>
                  <path d="M43 55q7-12 14 0-7 13-14 0Z" fill="#5B9290"/>
                  <path d="M43 55h14" stroke="#5B9290" stroke-width="2"/>
                </svg>
              </span>
              <span class="info-tile-copy">
                <small>MANTÉNLO EN BUEN ESTADO</small>
                <strong>Conservación</strong>
                <span>Cuida tu producto</span>
              </span>
              <span class="info-tile-arrow">↗</span>
            </button>
          </div>

          @if (activeInfo()) {
            <article class="info-expanded-panel">
              <div class="expanded-panel-heading">
                <div>
                  <span class="eyebrow">HUELLAS DULCES TE CUENTA</span>
                  <h3>{{ activeInfoTitle() }}</h3>
                </div>
                <button type="button" class="close-info-button"
                  aria-label="Volver a las tarjetas"
                  (click)="activeInfo.set(null)">×</button>
              </div>

              <p>{{ activeInfoText() }}</p>

              @if (activeInfo() === 'characteristics') {
                <div class="info-note">
                  {{ info.note }}
                </div>
              }
            </article>
          } @else {
            <div class="info-hint">
              <span class="hint-dot"></span>
              Pulsa una tarjeta para descubrir su información.
            </div>
          }
        </section>


      }
    } @else {
      <div class="empty-state">
        <h2>Producto no encontrado</h2>
        <p>Puede que ya no esté disponible en nuestro catálogo.</p>
        <a routerLink="/" class="back-link">Regresar al catálogo</a>
      </div>
    }
  `
})
export class ProductDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly notifications = inject(NotificationService);

  readonly cart = inject(CartService);
  readonly quantity = signal(1);
  readonly activeInfo = signal<InfoSection | null>(null);
  readonly calculatorOpen = signal(false);

  readonly petSpecies = signal('Perro');
  readonly petWeight = signal<number | null>(null);
  readonly petSize = signal('Mediano');
  readonly petStage = signal('Adulto');
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

  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap
  });

  readonly product = computed(() => {
    const id = Number(this.params().get('id'));
    return this.productService.getProductById(id);
  });

  readonly productImage = computed(() => {
    const currentProduct = this.product();
    return currentProduct ? productImagePath(currentProduct) : '';
  });

  readonly details = computed(() => {
    const currentProduct = this.product();
    return currentProduct ? getProductInformation(currentProduct) : null;
  });

  readonly activeInfoTitle = computed(() => {
    const titles: Record<InfoSection, string> = {
      type: 'Tipo de producto',
      audience: '¿Para quién está indicado?',
      purpose: 'Uso principal',
      characteristics: 'Características del producto',
      recommendation: 'Recomendaciones de uso',
      conservation: 'Conservación del producto'
    };

    const section = this.activeInfo();
    return section ? titles[section] : '';
  });

  readonly activeInfoText = computed(() => {
    const info = this.details();
    const section = this.activeInfo();

    if (!info || !section) return '';

    const descriptions: Record<InfoSection, string> = {
      type: info.type,
      audience: info.audience,
      purpose: info.purpose,
      characteristics: info.characteristics,
      recommendation: info.recommendation,
      conservation: info.conservation
    };

    return descriptions[section];
  });

  updateSpecies(event: Event): void {
    this.petSpecies.set((event.target as HTMLSelectElement).value);
  }

  updatePetSize(event: Event): void {
    this.petSize.set((event.target as HTMLSelectElement).value);
  }

  updatePetStage(event: Event): void {
    this.petStage.set((event.target as HTMLSelectElement).value);
  }

  updateMeals(event: Event): void {
    this.mealsPerDay.set(Number((event.target as HTMLSelectElement).value));
  }

  updatePetWeight(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.petWeight.set(value > 0 ? value : null);
  }

  updateDailyRation(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.dailyRation.set(value > 0 ? value : null);
  }

  toggleInfo(section: InfoSection): void {
    this.activeInfo.update(current =>
      current === section ? null : section
    );
  }

  increaseQuantity(): void {
    const item = this.product();

    if (item && this.quantity() < item.stock) {
      this.quantity.update(value => value + 1);
    }
  }

  decreaseQuantity(): void {
    this.quantity.update(value => Math.max(1, value - 1));
  }

  addToCart(item: Product): void {
    this.cart.add(item, this.quantity());
    this.notifications.notify(
      `${this.quantity()} unidad(es) de ${item.name} agregada(s) al carrito`
    );
  }

  toggleFavorite(item: Product): void {
    this.cart.toggleFavorite(item.id);

    this.notifications.notify(
      this.cart.isFavorite(item.id)
        ? 'Producto agregado a favoritos'
        : 'Producto retirado de favoritos'
    );
  }
}



