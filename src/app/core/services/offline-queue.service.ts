import { Injectable, signal } from '@angular/core';
import { ProductRequest } from '../../models/product.model';

export interface PendingProduct {
  id: string;
  request: ProductRequest;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class OfflineQueueService {
  private readonly storageKey = 'huellas-dulces-pending-products';

  private readonly queueState = signal<PendingProduct[]>(this.loadQueue());

  readonly pendingProducts = this.queueState.asReadonly();
  readonly pendingCount = signal(this.queueState().length);

  private loadQueue(): PendingProduct[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const stored = window.localStorage.getItem(this.storageKey);

      if (!stored) {
        return [];
      }

      const parsed: unknown = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed as PendingProduct[] : [];
    } catch {
      return [];
    }
  }

  private saveQueue(items: PendingProduct[]): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      window.localStorage.setItem(
        this.storageKey,
        JSON.stringify(items)
      );

      return true;
    } catch {
      console.error('No fue posible guardar la cola offline.');
      return false;
    }
  }

  enqueue(request: ProductRequest): boolean {
    const pending: PendingProduct = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      request: { ...request },
      createdAt: new Date().toISOString()
    };

    const updatedQueue = [...this.queueState(), pending];

    if (!this.saveQueue(updatedQueue)) {
      return false;
    }

    this.queueState.set(updatedQueue);
    this.pendingCount.set(updatedQueue.length);

    return true;
  }

  remove(id: string): boolean {
    const updatedQueue = this.queueState().filter(
      item => item.id !== id
    );

    if (!this.saveQueue(updatedQueue)) {
      return false;
    }

    this.queueState.set(updatedQueue);
    this.pendingCount.set(updatedQueue.length);

    return true;
  }

  getPending(): PendingProduct[] {
    return [...this.queueState()];
  }
}
