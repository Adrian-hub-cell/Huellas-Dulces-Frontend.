
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');

    TestBed.configureTestingModule({
      providers: [ThemeService]
    });

    service = TestBed.inject(ThemeService);
    TestBed.tick();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('debe iniciar en modo claro cuando no existe una preferencia guardada', () => {
    expect(service.darkMode()).toBe(false);
  });

  it('debe iniciar en modo oscuro cuando existe una preferencia guardada', () => {
    TestBed.resetTestingModule();
    localStorage.setItem('huellas-theme', 'dark');

    TestBed.configureTestingModule({
      providers: [ThemeService]
    });

    service = TestBed.inject(ThemeService);
    TestBed.tick();

    expect(service.darkMode()).toBe(true);
  });

  it('debe guardar el tema claro en localStorage', () => {
    expect(localStorage.getItem('huellas-theme')).toBe('light');
  });

  it('debe guardar el tema oscuro en localStorage al activarlo', () => {
    service.darkMode.set(true);
    TestBed.tick();

    expect(localStorage.getItem('huellas-theme')).toBe('dark');
  });

  it('debe activar la clase dark en el documento', () => {
    service.darkMode.set(true);
    TestBed.tick();

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('debe quitar la clase dark cuando el tema es claro', () => {
    service.darkMode.set(true);
    TestBed.tick();

    service.darkMode.set(false);
    TestBed.tick();

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('debe cambiar de claro a oscuro al ejecutar toggle', () => {
    service.toggle();

    expect(service.darkMode()).toBe(true);
  });

  it('debe cambiar de oscuro a claro al ejecutar toggle', () => {
    service.darkMode.set(true);

    service.toggle();

    expect(service.darkMode()).toBe(false);
  });
});
