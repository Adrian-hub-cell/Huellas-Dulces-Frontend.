import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../../models/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  readonly items = signal<CartItem[]>([]);
  readonly favorites = signal<number[]>([]);

  readonly count = computed(() =>
    this.items().reduce((total, item) => total + item.quantity, 0)
  );

  readonly subtotal = computed(() =>
    this.items().reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    )
  );

  add(product: Product, quantity = 1): void {
    if (product.stock <= 0 || quantity <= 0) return;

    this.items.update(current => {
      const existing = current.find(
        item => item.product.id === product.id
      );

      if (existing) {
        return current.map(item =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: Math.min(
                  product.stock,
                  item.quantity + quantity
                )
              }
            : item
        );
      }

      return [
        ...current,
        {
          product,
          quantity: Math.min(product.stock, quantity)
        }
      ];
    });
  }

  increase(productId: number): void {
    const item = this.items().find(
      current => current.product.id === productId
    );

    if (item) {
      this.setQuantity(productId, item.quantity + 1);
    }
  }

  decrease(productId: number): void {
    const item = this.items().find(
      current => current.product.id === productId
    );

    if (item) {
      this.setQuantity(productId, item.quantity - 1);
    }
  }

  setQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }

    this.items.update(current =>
      current.map(item =>
        item.product.id === productId
          ? {
              ...item,
              quantity: Math.min(quantity, item.product.stock)
            }
          : item
      )
    );
  }

  remove(productId: number): void {
    this.items.update(current =>
      current.filter(item => item.product.id !== productId)
    );
  }

  clear(): void {
    this.items.set([]);
  }

  toggleFavorite(productId: number): void {
    this.favorites.update(current =>
      current.includes(productId)
        ? current.filter(id => id !== productId)
        : [...current, productId]
    );
  }

  isFavorite(productId: number): boolean {
    return this.favorites().includes(productId);
  }
}
