
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  EMPTY,
  ReplaySubject,
  concatMap,
  catchError,
  finalize,
  from,
  tap
} from 'rxjs';
import { Product } from '../../models/product.model';
import { OfflineQueueService } from './offline-queue.service';

@Injectable({ providedIn: 'root' })
export class OfflineSyncService {
  private readonly http = inject(HttpClient);
  private readonly queue = inject(OfflineQueueService);

  readonly syncing = signal(false);
  readonly lastSync = signal<Date | null>(null);

  readonly syncCompleted$ = new ReplaySubject<Product>(50);

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.syncQueue());

      if (navigator.onLine) {
        this.syncQueue();
      }
    }
  }

  syncQueue(): void {
    if (
      typeof navigator !== 'undefined' &&
      !navigator.onLine
    ) {
      return;
    }

    if (this.syncing() || this.queue.pendingCount() === 0) {
      return;
    }

    this.syncing.set(true);

    from(this.queue.getPending()).pipe(
      concatMap(item =>
        this.http.post<Product>('/api/v1/products', item.request).pipe(
          tap(product => {
            if (this.queue.remove(item.id)) {
              this.syncCompleted$.next(product);
              this.lastSync.set(new Date());
            }
          }),
          catchError(() => EMPTY)
        )
      ),
      finalize(() => this.syncing.set(false))
    ).subscribe();
  }
}
