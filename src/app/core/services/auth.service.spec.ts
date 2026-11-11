
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { AuthService } from './auth.service';
import {
  CustomerRegisterRequest,
  CustomerRegisterResponse
} from '../../models/customer-registration.model';
import { LoginResponse } from '../../models/product.model';

describe('AuthService', () => {
  let service: AuthService;
  let controller: HttpTestingController;

  beforeEach(() => {
    localStorage.removeItem('huellas-token');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AuthService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controller.verify();
    localStorage.removeItem('huellas-token');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start unauthenticated when there is no token', () => {
    expect(service.token()).toBeNull();
    expect(service.authenticated()).toBe(false);
  });

  it('should save the JWT after a successful login', () => {
    const credentials = {
      username: 'admin',
      password: 'Admin123*'
    };

    const response: LoginResponse = {
      accessToken: 'jwt-test-token',
      tokenType: 'Bearer'
    };

    service.login(credentials).subscribe(result => {
      expect(result).toEqual(response);
      expect(service.token()).toBe('jwt-test-token');
      expect(service.authenticated()).toBe(true);
      expect(localStorage.getItem('huellas-token'))
        .toBe('jwt-test-token');
    });

    const request = controller.expectOne('/api/v1/auth/login');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);

    request.flush(response);
  });

  it('should clear the token when logging out', () => {
    service.token.set('jwt-test-token');
    localStorage.setItem('huellas-token', 'jwt-test-token');

    service.logout();

    expect(service.token()).toBeNull();
    expect(service.authenticated()).toBe(false);
    expect(localStorage.getItem('huellas-token')).toBeNull();
  });

  it('should register a customer successfully', () => {
    const customer: CustomerRegisterRequest = {
      firstName: 'Ana',
      lastName: 'Gomez',
      identificationNumber: '123456789',
      email: 'ana@example.com',
      phone: '3001234567',
      address: 'Calle 10',
      username: 'ana123',
      password: 'Ana123*'
    };

    const response: CustomerRegisterResponse = {
      id: 1,
      username: 'ana123',
      email: 'ana@example.com',
      message: 'Cliente registrado correctamente'
    };

    service.registerCustomer(customer).subscribe(result => {
      expect(result).toEqual(response);
    });

    const request = controller.expectOne('/api/v1/auth/register');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(customer);

    request.flush(response);
  });
});
