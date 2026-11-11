
import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { LoginRequest, LoginResponse } from '../../models/product.model';
import {
  CustomerRegisterRequest,
  CustomerRegisterResponse
} from '../../models/customer-registration.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly token = signal<string | null>(
    typeof window !== 'undefined'
      ? window.localStorage.getItem('huellas-token')
      : null
  );

  readonly authenticated = computed(() => !!this.token());

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      '/api/v1/auth/login',
      credentials
    ).pipe(
      tap(response => {
        this.token.set(response.accessToken);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(
            'huellas-token',
            response.accessToken
          );
        }
      })
    );
  }

  registerCustomer(
    customer: CustomerRegisterRequest
  ): Observable<CustomerRegisterResponse> {
    return this.http.post<CustomerRegisterResponse>(
      '/api/v1/auth/register',
      customer
    );
  }

  logout(): void {
    this.token.set(null);

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('huellas-token');
    }
  }
}
