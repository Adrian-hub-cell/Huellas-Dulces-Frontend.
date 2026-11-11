
import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    localStorage.removeItem('huellas-token');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([authInterceptor])
        ),
        provideHttpClientTesting()
      ]
    });

    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    controller.verify();
    localStorage.removeItem('huellas-token');
  });

  it('should add the Bearer token to API requests', () => {
    authService.token.set('jwt-test-token');

    http.get('/api/v1/products').subscribe();

    const request = controller.expectOne('/api/v1/products');

    expect(request.request.headers.get('Authorization'))
      .toBe('Bearer jwt-test-token');

    request.flush([]);
  });

  it('should not add authorization when there is no token', () => {
    authService.token.set(null);

    http.get('/api/v1/products').subscribe();

    const request = controller.expectOne('/api/v1/products');

    expect(request.request.headers.has('Authorization'))
      .toBe(false);

    request.flush([]);
  });

  it('should not add the token to external requests', () => {
    authService.token.set('jwt-test-token');

    http.get('https://example.com/products').subscribe();

    const request = controller.expectOne(
      'https://example.com/products'
    );

    expect(request.request.headers.has('Authorization'))
      .toBe(false);

    request.flush([]);
  });
});
