


import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { CartService } from '../core/services/cart.service';
import { ProductService } from '../core/services/product.service';
import { NotificationService } from '../core/services/notification.service';
import { ThemeService } from '../core/services/theme.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CurrencyPipe],
  template: `
    <header class="site-header">
      <a routerLink="/" class="brand">
        <span class="brand-icon">HD</span>
        <span>Huellas <strong>Dulces</strong></span>
      </a>

      <div class="header-actions">

        <div class="header-menu">
          <button class="header-shop-button"
            type="button"
            (click)="toggleFavorites()">
            Favoritos <span>{{ cart.favorites().length }}</span>
          </button>

          @if (favoritesOpen()) {
            <section class="shop-dropdown favorites-dropdown">
              <div class="dropdown-heading">
                <div>
                  <strong>Mis favoritos</strong>
                  <small>Productos que te gustan</small>
                </div>
                <button type="button" class="close-dropdown"
                  (click)="favoritesOpen.set(false)">
                  ×
                </button>
              </div>

              @for (product of favoriteProducts(); track product.id) {
                <div class="favorite-line">
                  <a [routerLink]="['/products', product.id]"
                    (click)="favoritesOpen.set(false)">
                    <strong>{{ product.name }}</strong>
                    <small>{{ product.category }}</small>
                  </a>

                  <button type="button" class="remove-button"
                    aria-label="Quitar favorito"
                    (click)="cart.toggleFavorite(product.id)">
                    Quitar
                  </button>
                </div>
              } @empty {
                <p class="dropdown-empty">
                  Todavía no tienes productos favoritos.
                  Guarda los que más te gusten.
                </p>
              }
            </section>
          }
        </div>

        <div class="header-menu">
          <button class="header-shop-button"
            type="button"
            (click)="toggleNotifications()"
            [attr.aria-expanded]="notificationsOpen()">
            Notificaciones
            <span>{{ notifications.count() }}</span>
          </button>

          @if (notificationsOpen()) {
            <section class="shop-dropdown notifications-dropdown">
              <div class="dropdown-heading">
                <div>
                  <strong>Notificaciones</strong>
                  <small>{{ notifications.count() }} mensajes recibidos</small>
                </div>

                <button type="button" class="close-dropdown"
                  aria-label="Cerrar notificaciones"
                  (click)="notificationsOpen.set(false)">
                  ×
                </button>
              </div>

              @for (message of notifications.messages(); track $index) {
                <div class="notification-line">
                  <span class="notification-icon">🔔</span>
                  <p>{{ message }}</p>
                </div>
              } @empty {
                <p class="dropdown-empty">
                  No tienes notificaciones por ahora.
                </p>
              }

              @if (notifications.messages().length > 0) {
                <button class="clear-notifications-button"
                  type="button"
                  (click)="clearNotifications()">
                  Limpiar notificaciones
                </button>
              }
            </section>
          }
        </div>

        <div class="header-menu">
          <button class="header-shop-button cart-trigger"
            type="button"
            (click)="toggleCart()">
            Carrito <span>{{ cart.count() }}</span>
          </button>

          @if (cartOpen()) {
            <section class="shop-dropdown cart-dropdown">
              <div class="dropdown-heading">
                <div>
                  <strong>Mi carrito</strong>
                  <small>{{ cart.count() }} unidades seleccionadas</small>
                </div>
                <button type="button" class="close-dropdown"
                  (click)="cartOpen.set(false)">
                  ×
                </button>
              </div>

              @for (item of cart.items(); track item.product.id) {
                <div class="cart-line">
                  <div class="cart-product-info">
                    <strong>{{ item.product.name }}</strong>
                    <span>
                      {{ item.product.price | currency:'COP':'$':'1.0-0' }}
                    </span>
                  </div>

                  <div class="cart-item-controls">
                    <button type="button"
                      (click)="cart.decrease(item.product.id)"
                      aria-label="Disminuir cantidad">−</button>

                    <strong>{{ item.quantity }}</strong>

                    <button type="button"
                      (click)="cart.increase(item.product.id)"
                      aria-label="Aumentar cantidad"
                      [disabled]="item.quantity >= item.product.stock">+</button>

                    <button type="button" class="remove-button"
                      (click)="cart.remove(item.product.id)">
                      Quitar
                    </button>
                  </div>
                </div>
              } @empty {
                <div class="dropdown-empty">
                  Tu carrito está vacío.
                  Explora el catálogo y agrega tus productos favoritos.
                </div>
              }

              @if (cart.items().length > 0) {
                <div class="cart-total">
                  <span>Subtotal</span>
                  <strong>
                    {{ cart.subtotal() | currency:'COP':'$':'1.0-0' }}
                  </strong>
                </div>

                <button class="clear-cart-button"
                  type="button"
                  (click)="cart.clear()">
                  Vaciar carrito
                </button>
              }

              <p class="cart-disclaimer">
                Carrito de demostración. Los productos no están reservados
                ni se ha realizado ningún pago.
              </p>
            </section>
          }
        </div>

        <button class="icon-button" type="button"
          (click)="theme.toggle()"
          [attr.aria-label]="theme.darkMode() ? 'Activar modo claro' : 'Activar modo oscuro'">
          {{ theme.darkMode() ? '☀' : 'Modo oscuro' }}
        </button>

        @if (auth.authenticated()) {
          <a routerLink="/profile" class="login-button">Mi perfil</a>
          <button class="login-button" type="button" (click)="logout()">
            Cerrar sesión
          </button>
        } @else {
          <a routerLink="/login" class="login-button">Iniciar sesión</a>
          <a routerLink="/crear-cuenta" class="login-button">Crear cuenta</a>
        }
      </div>
    </header>
  `
})
export class HeaderComponent {
  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);
  readonly theme = inject(ThemeService);
  readonly notifications = inject(NotificationService);

  private readonly productService = inject(ProductService);

  readonly cartOpen = signal(false);
  readonly favoritesOpen = signal(false);
  readonly notificationsOpen = signal(false);

  readonly favoriteProducts = computed(() => {
    const ids = new Set(this.cart.favorites());

    return this.productService.products().filter(
      product => ids.has(product.id)
    );
  });

  toggleCart(): void {
    this.cartOpen.update(value => !value);
    this.favoritesOpen.set(false);
    this.notificationsOpen.set(false);
  }

  toggleFavorites(): void {
    this.favoritesOpen.update(value => !value);
    this.cartOpen.set(false);
    this.notificationsOpen.set(false);
  }

  toggleNotifications(): void {
    this.notificationsOpen.update(value => !value);
    this.cartOpen.set(false);
    this.favoritesOpen.set(false);
  }

  clearNotifications(): void {
    this.notifications.clear();
  }

  logout(): void {
    this.auth.logout();
    this.notifications.notify('Sesión cerrada correctamente');
  }
}
