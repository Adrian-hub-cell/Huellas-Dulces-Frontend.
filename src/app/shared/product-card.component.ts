import { Component, computed, inject, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../models/product.model';
import { productImagePath } from './product-image.util';
import { CartService } from '../core/services/cart.service';
import { NotificationService } from '../core/services/notification.service';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe],
  template: `
    <article class="product-card">
      <div class="product-illustration">
        <img
          class="product-photo"
          [src]="productImage()"
          [alt]="'Fotografía de ' + product().name"
          loading="lazy">

        <span class="category-tag">{{ product().category }}</span>

        <button
          class="favorite-button"
          type="button"
          [class.is-favorite]="favorite()"
          [attr.aria-label]="favorite() ? 'Quitar de favoritos' : 'Agregar a favoritos'"
          [attr.aria-pressed]="favorite()"
          (click)="toggleFavorite()">
          {{ favorite() ? '♥' : '♡' }}
        </button>
      </div>

      <div class="product-card-body">
        <h3>{{ product().name }}</h3>
        <p class="product-description">{{ product().description }}</p>

        <div class="product-meta">
          <strong>{{ product().price | currency:'COP':'$':'1.0-0' }}</strong>
          <span [class.out-of-stock]="product().stock === 0">
            {{ product().stock > 0 ? product().stock + ' disponibles' : 'Agotado' }}
          </span>
        </div>

        <div class="card-actions">
          <button class="secondary-button" type="button"
            (click)="selected.emit(product())">
            Ver detalles
          </button>

          <button class="add-cart-button" type="button"
            [disabled]="product().stock === 0"
            (click)="addToCart()">
            {{ product().stock === 0 ? 'Agotado' : 'Agregar + ' }}
          </button>
        </div>
      </div>
    </article>
  `
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly selected = output<Product>();

  readonly cart = inject(CartService);
  private readonly notifications = inject(NotificationService);

  readonly productImage = computed(() =>
    productImagePath(this.product())
  );

  readonly favorite = computed(() =>
    this.cart.isFavorite(this.product().id)
  );

  toggleFavorite(): void {
    this.cart.toggleFavorite(this.product().id);

    this.notifications.notify(
      this.favorite()
        ? 'Producto agregado a favoritos'
        : 'Producto retirado de favoritos'
    );
  }

  addToCart(): void {
    const item = this.product();

    if (item.stock <= 0) return;

    this.cart.add(item);

    this.notifications.notify(
      `${item.name} agregado al carrito`
    );
  }
}
