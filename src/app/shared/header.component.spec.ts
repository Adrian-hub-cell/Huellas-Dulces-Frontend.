
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import { HeaderComponent } from './header.component';
import { AuthService } from '../core/services/auth.service';
import { CartService } from '../core/services/cart.service';
import { ProductService } from '../core/services/product.service';
import { NotificationService } from '../core/services/notification.service';
import { ThemeService } from '../core/services/theme.service';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;

  const authMock = {
    authenticated: signal(false),
    logout: vi.fn()
  };

  const cartMock = {
    favorites: signal<number[]>([]),
    items: signal<any[]>([]),
    count: signal(0),
    subtotal: signal(0),
    toggleFavorite: vi.fn(),
    increase: vi.fn(),
    decrease: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn()
  };

  const productMock = {
    products: signal<any[]>([])
  };

  const notificationMock = {
    messages: signal<string[]>([]),
    count: () => notificationMock.messages().length,
    notify: vi.fn(),
    clear: vi.fn()
  };

  const themeMock = {
    darkMode: signal(false),
    toggle: vi.fn()
  };

  const product = {
    id: 1,
    name: 'Croquetas para perro',
    description: 'Alimento para perros',
    category: 'Alimentos',
    price: 45000,
    stock: 10,
    available: true
  };

  beforeEach(async () => {
    authMock.authenticated.set(false);
    cartMock.favorites.set([]);
    cartMock.items.set([]);
    cartMock.count.set(0);
    cartMock.subtotal.set(0);
    productMock.products.set([]);
    notificationMock.messages.set([]);
    themeMock.darkMode.set(false);

    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authMock },
        { provide: CartService, useValue: cartMock },
        { provide: ProductService, useValue: productMock },
        { provide: NotificationService, useValue: notificationMock },
        { provide: ThemeService, useValue: themeMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Busca botones por texto visible o por aria-label.
  function clickButton(text: string): void {
    const button = Array.from(
      fixture.nativeElement.querySelectorAll('button')
    ).find((element: any) =>
      element.textContent.trim().includes(text) ||
      element.getAttribute('aria-label')?.includes(text)
    ) as HTMLButtonElement | undefined;

    if (!button) {
      throw new Error(`No se encontró el botón: ${text}`);
    }

    button.click();
    fixture.detectChanges();
  }

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar el nombre de Huellas Dulces', () => {
    expect(fixture.nativeElement.textContent).toContain('Huellas');
    expect(fixture.nativeElement.textContent).toContain('Dulces');
  });

  it('debe mostrar los enlaces de inicio de sesión cuando no está autenticado', () => {
    expect(fixture.nativeElement.textContent).toContain('Iniciar sesión');
    expect(fixture.nativeElement.textContent).toContain('Crear cuenta');
    expect(fixture.nativeElement.textContent).not.toContain('Cerrar sesión');
  });

  it('debe mostrar el perfil y cerrar sesión cuando está autenticado', () => {
    authMock.authenticated.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Mi perfil');
    expect(fixture.nativeElement.textContent).toContain('Cerrar sesión');
    expect(fixture.nativeElement.textContent).not.toContain('Crear cuenta');
  });

  it('debe abrir y cerrar el menú del carrito', () => {
    component.toggleCart();
    fixture.detectChanges();

    expect(component.cartOpen()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Mi carrito');

    component.toggleCart();
    fixture.detectChanges();

    expect(component.cartOpen()).toBe(false);
  });

  it('debe cerrar favoritos y notificaciones al abrir el carrito', () => {
    component.favoritesOpen.set(true);
    component.notificationsOpen.set(true);

    component.toggleCart();

    expect(component.cartOpen()).toBe(true);
    expect(component.favoritesOpen()).toBe(false);
    expect(component.notificationsOpen()).toBe(false);
  });

  it('debe abrir y cerrar el menú de favoritos', () => {
    component.toggleFavorites();
    fixture.detectChanges();

    expect(component.favoritesOpen()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Mis favoritos');

    component.toggleFavorites();

    expect(component.favoritesOpen()).toBe(false);
  });

  it('debe cerrar los otros menús al abrir favoritos', () => {
    component.cartOpen.set(true);
    component.notificationsOpen.set(true);

    component.toggleFavorites();

    expect(component.favoritesOpen()).toBe(true);
    expect(component.cartOpen()).toBe(false);
    expect(component.notificationsOpen()).toBe(false);
  });

  it('debe mostrar un mensaje cuando no hay favoritos', () => {
    component.toggleFavorites();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Todavía no tienes productos favoritos'
    );
  });

  it('debe mostrar los productos favoritos', () => {
    productMock.products.set([product]);
    cartMock.favorites.set([1]);

    fixture.detectChanges();
    component.toggleFavorites();
    fixture.detectChanges();

    expect(component.favoriteProducts()).toEqual([product]);
    expect(fixture.nativeElement.textContent).toContain(
      'Croquetas para perro'
    );
  });

  it('debe llamar al servicio al quitar un favorito', () => {
    productMock.products.set([product]);
    cartMock.favorites.set([1]);

    component.toggleFavorites();
    fixture.detectChanges();

    clickButton('Quitar');

    expect(cartMock.toggleFavorite).toHaveBeenCalledWith(1);
  });

  it('debe abrir y cerrar el menú de notificaciones', () => {
    component.toggleNotifications();
    fixture.detectChanges();

    expect(component.notificationsOpen()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Notificaciones');

    component.toggleNotifications();

    expect(component.notificationsOpen()).toBe(false);
  });

  it('debe cerrar los otros menús al abrir notificaciones', () => {
    component.cartOpen.set(true);
    component.favoritesOpen.set(true);

    component.toggleNotifications();

    expect(component.notificationsOpen()).toBe(true);
    expect(component.cartOpen()).toBe(false);
    expect(component.favoritesOpen()).toBe(false);
  });

  it('debe mostrar un mensaje cuando no hay notificaciones', () => {
    component.toggleNotifications();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'No tienes notificaciones por ahora'
    );
  });

  it('debe mostrar las notificaciones recibidas', () => {
    notificationMock.messages.set(['Nuevo producto disponible']);

    component.toggleNotifications();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Nuevo producto disponible'
    );
    expect(fixture.nativeElement.textContent).toContain('1 mensajes recibidos');
  });

  it('debe limpiar las notificaciones', () => {
    notificationMock.messages.set(['Mensaje de prueba']);

    component.clearNotifications();

    expect(notificationMock.clear).toHaveBeenCalled();
  });

  it('debe mostrar el botón para limpiar cuando hay notificaciones', () => {
    notificationMock.messages.set(['Mensaje de prueba']);

    component.toggleNotifications();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Limpiar notificaciones'
    );
  });

  it('debe mostrar el carrito vacío cuando no hay productos', () => {
    component.toggleCart();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Tu carrito está vacío'
    );
  });

  it('debe mostrar los productos agregados al carrito', () => {
    cartMock.items.set([
      { product, quantity: 2 }
    ]);
    cartMock.count.set(2);
    cartMock.subtotal.set(90000);

    component.toggleCart();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Croquetas para perro'
    );
    expect(fixture.nativeElement.textContent).toContain('2');
    expect(fixture.nativeElement.textContent).toContain('Subtotal');
  });

  it('debe llamar al servicio para aumentar la cantidad', () => {
    cartMock.items.set([{ product, quantity: 2 }]);

    component.toggleCart();
    fixture.detectChanges();

    clickButton('+');

    expect(cartMock.increase).toHaveBeenCalledWith(1);
  });

  it('debe llamar al servicio para disminuir la cantidad', () => {
    cartMock.items.set([{ product, quantity: 2 }]);

    component.toggleCart();
    fixture.detectChanges();

    clickButton('Disminuir cantidad');

    expect(cartMock.decrease).toHaveBeenCalledWith(1);
  });

  it('debe llamar al servicio para quitar un producto del carrito', () => {
    cartMock.items.set([{ product, quantity: 2 }]);

    component.toggleCart();
    fixture.detectChanges();

    clickButton('Quitar');

    expect(cartMock.remove).toHaveBeenCalledWith(1);
  });

  it('debe llamar al servicio para vaciar el carrito', () => {
    cartMock.items.set([{ product, quantity: 2 }]);

    component.toggleCart();
    fixture.detectChanges();

    clickButton('Vaciar carrito');

    expect(cartMock.clear).toHaveBeenCalled();
  });

  it('debe llamar al servicio para cambiar el tema', () => {
    component.theme.toggle();

    expect(themeMock.toggle).toHaveBeenCalled();
  });

  it('debe mostrar la opción para activar modo oscuro', () => {
    themeMock.darkMode.set(false);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.icon-button')
        .getAttribute('aria-label')
    ).toBe('Activar modo oscuro');
  });

  it('debe mostrar la opción para activar modo claro', () => {
    themeMock.darkMode.set(true);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.icon-button')
        .getAttribute('aria-label')
    ).toBe('Activar modo claro');
  });

  it('debe cerrar sesión y generar una notificación', () => {
    component.logout();

    expect(authMock.logout).toHaveBeenCalled();
    expect(notificationMock.notify).toHaveBeenCalledWith(
      'Sesión cerrada correctamente'
    );
  });
});

