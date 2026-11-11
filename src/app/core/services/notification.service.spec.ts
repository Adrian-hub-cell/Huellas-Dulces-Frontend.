
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationService]
    });

    service = TestBed.inject(NotificationService);
  });

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe iniciar con una lista de mensajes vacía', () => {
    expect(service.messages()).toEqual([]);
  });

  it('debe iniciar con el contador en cero', () => {
    expect(service.count()).toBe(0);
  });

  it('debe agregar una notificación', () => {
    service.notify('Nuevo producto registrado');

    expect(service.messages()).toEqual([
      'Nuevo producto registrado'
    ]);
  });

  it('debe incrementar el contador al agregar una notificación', () => {
    service.notify('Primera notificación');

    expect(service.count()).toBe(1);
  });

  it('debe acumular varias notificaciones', () => {
    service.notify('Primera notificación');
    service.notify('Segunda notificación');
    service.notify('Tercera notificación');

    expect(service.messages()).toEqual([
      'Primera notificación',
      'Segunda notificación',
      'Tercera notificación'
    ]);
    expect(service.count()).toBe(3);
  });

  it('debe conservar los mensajes anteriores al agregar uno nuevo', () => {
    service.notify('Primer mensaje');
    service.notify('Segundo mensaje');

    expect(service.messages()).toHaveLength(2);
    expect(service.messages()[0]).toBe('Primer mensaje');
    expect(service.messages()[1]).toBe('Segundo mensaje');
  });

  it('debe permitir agregar un mensaje vacío', () => {
    service.notify('');

    expect(service.messages()).toEqual(['']);
    expect(service.count()).toBe(1);
  });

  it('debe limpiar todas las notificaciones', () => {
    service.notify('Primera notificación');
    service.notify('Segunda notificación');

    service.clear();

    expect(service.messages()).toEqual([]);
  });

  it('debe actualizar el contador a cero al limpiar las notificaciones', () => {
    service.notify('Primera notificación');
    service.notify('Segunda notificación');

    service.clear();

    expect(service.count()).toBe(0);
  });

  it('debe permitir limpiar una lista que ya está vacía', () => {
    service.clear();

    expect(service.messages()).toEqual([]);
    expect(service.count()).toBe(0);
  });

  it('debe permitir agregar nuevas notificaciones después de limpiar', () => {
    service.notify('Notificación anterior');
    service.clear();
    service.notify('Notificación nueva');

    expect(service.messages()).toEqual([
      'Notificación nueva'
    ]);
    expect(service.count()).toBe(1);
  });
});
