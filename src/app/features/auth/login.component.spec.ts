import { TestBed } from '@angular/core/testing';
import { render, screen, fireEvent, waitFor } from '@testing-library/angular';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, Subject, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { RealtimeService } from '../../core/services/realtime.service';

describe('LoginComponent', () => {
  const authMock = {
    login: vi.fn()
  };

  const notificationsMock = {
    notify: vi.fn()
  };

  const realtimeMock = {
    connect: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();

    authMock.login.mockReturnValue(
      of({
        accessToken: 'token-prueba',
        tokenType: 'Bearer'
      })
    );
  });

  async function setup() {
    await render(LoginComponent, {
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authMock },
        { provide: NotificationService, useValue: notificationsMock },
        { provide: RealtimeService, useValue: realtimeMock }
      ]
    });
  }

  function fillForm() {
    fireEvent.input(screen.getByPlaceholderText('Nombre de usuario'), {
      target: { value: 'admin' }
    });

    const passwordInput = document.querySelector(
      'input[type="password"]'
    ) as HTMLInputElement;

    fireEvent.input(passwordInput, {
      target: { value: 'Admin123*' }
    });
  }

  function submitForm() {
    const button = screen.getByRole('button', { name: /Ingresar/ });
    const form = button.closest('form');

    if (!form) {
      throw new Error('No se encontró el formulario de inicio de sesión');
    }

    fireEvent.submit(form);
  }

  it('debe crear el componente', async () => {
    await setup();

    expect(
      screen.getByRole('heading', { name: /Iniciar sesi/ })
    ).toBeTruthy();
  });

  it('debe marcar los campos obligatorios si se intenta ingresar vacío', async () => {
    await setup();

    submitForm();

    expect(authMock.login).not.toHaveBeenCalled();
    expect(screen.getAllByText(/Escribe tu/)).toHaveLength(2);
  });

  it('debe iniciar sesión correctamente y conectar los servicios', async () => {
    await setup();

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fillForm();
    submitForm();

    expect(authMock.login).toHaveBeenCalledWith({
      username: 'admin',
      password: 'Admin123*'
    });

    expect(realtimeMock.connect).toHaveBeenCalledOnce();
    expect(notificationsMock.notify).toHaveBeenCalledOnce();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('debe mostrar un mensaje cuando las credenciales son incorrectas', async () => {
    authMock.login.mockReturnValue(
      throwError(() => new Error('Credenciales incorrectas'))
    );

    await setup();

    fillForm();
    submitForm();

    expect(screen.getByText(/Usuario o contrase/)).toBeTruthy();
    expect(realtimeMock.connect).not.toHaveBeenCalled();
    expect(notificationsMock.notify).not.toHaveBeenCalled();
  });

  it('debe mostrar el estado de carga mientras espera la respuesta', async () => {
    const response = new Subject<{
      accessToken: string;
      tokenType: string;
    }>();

    authMock.login.mockReturnValue(response);

    await setup();

    fillForm();
    submitForm();

    const loadingButton = screen.getByRole('button', {
      name: 'Ingresando...'
    }) as HTMLButtonElement;

    expect(loadingButton.disabled).toBe(true);

    response.next({
      accessToken: 'token-prueba',
      tokenType: 'Bearer'
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Ingresar' })
      ).toBeTruthy();
    });
  });
});
