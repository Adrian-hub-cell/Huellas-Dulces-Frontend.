
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ProductCardComponent } from './product-card.component';
import { CartService } from '../core/services/cart.service';
import { NotificationService } from '../core/services/notification.service';
import { Product } from '../models/product.model';

describe('ProductCardComponent', () => {
  let fixture: ComponentFixture<ProductCardComponent>;
  let component: ProductCardComponent;
  let cartService: CartService;

  let notificationService: {
    notify: ReturnType<typeof vi.fn>;
  };

  const product: Product = {
    id: 1,
    name: 'Croquetas para perro adulto',
    description: 'Alimento completo para perros adultos.',
    category: 'Alimento para perros',
    price: 25000,
    stock: 15,
    available: true
  };

  beforeEach(async () => {
    notificationService = {
      notify: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ProductCardComponent],
      providers: [
        CartService,
        {
          provide: NotificationService,
          useValue: notificationService
        }
      ]
    }).compileComponents();

    cartService = TestBed.inject(CartService);

    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('product', product);
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar la información del producto', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('h3')?.textContent)
      .toContain(product.name);

    expect(element.querySelector('.product-description')?.textContent)
      .toContain(product.description);

    expect(element.querySelector('.category-tag')?.textContent)
      .toContain(product.category);

    expect(element.textContent).toContain('15 disponibles');
  });

  it('debe mostrar la imagen correspondiente al producto', () => {
    const image: HTMLImageElement =
      fixture.nativeElement.querySelector('.product-photo');

    expect(image.src).toContain('/products/croquetas-perro.jpg');
    expect(image.alt).toBe(`Fotografía de ${product.name}`);
  });

  it('debe mostrar el precio en pesos colombianos', () => {
    const element: HTMLElement = fixture.nativeElement;
    const price = element.querySelector('.product-meta strong')?.textContent ?? '';

    expect(price.replace(/\s/g, '')).toMatch(/\$25[.,]000/);
  });

  it('debe emitir el producto al seleccionar Ver detalles', () => {
    const selectedSpy = vi.fn();
    component.selected.subscribe(selectedSpy);

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('.secondary-button');

    button.click();

    expect(selectedSpy).toHaveBeenCalledWith(product);
  });

  it('debe agregar un producto a favoritos', () => {
    component.toggleFavorite();

    expect(cartService.isFavorite(product.id)).toBe(true);

    expect(notificationService.notify)
      .toHaveBeenCalledWith('Producto agregado a favoritos');
  });

  it('debe retirar un producto de favoritos', () => {
    cartService.toggleFavorite(product.id);

    component.toggleFavorite();

    expect(cartService.isFavorite(product.id)).toBe(false);

    expect(notificationService.notify)
      .toHaveBeenCalledWith('Producto retirado de favoritos');
  });

  it('debe reflejar el estado de favorito en el botón', () => {
    cartService.toggleFavorite(product.id);
    fixture.detectChanges();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('.favorite-button');

    expect(button.classList.contains('is-favorite')).toBe(true);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Quitar de favoritos');
  });

  it('debe mostrar el estado inicial cuando no es favorito', () => {
    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('.favorite-button');

    expect(button.classList.contains('is-favorite')).toBe(false);
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe('Agregar a favoritos');
  });

  it('debe agregar un producto disponible al carrito', () => {
    component.addToCart();

    expect(cartService.items()).toHaveLength(1);
    expect(cartService.items()[0].product).toEqual(product);
    expect(cartService.items()[0].quantity).toBe(1);

    expect(notificationService.notify)
      .toHaveBeenCalledWith('Croquetas para perro adulto agregado al carrito');
  });

  it('no debe agregar al carrito un producto agotado', () => {
    const unavailableProduct = { ...product, stock: 0 };

    fixture.componentRef.setInput('product', unavailableProduct);
    fixture.detectChanges();

    component.addToCart();

    expect(cartService.items()).toHaveLength(0);
    expect(notificationService.notify).not.toHaveBeenCalled();
  });

  it('debe deshabilitar el botón de carrito cuando no hay stock', () => {
    fixture.componentRef.setInput('product', { ...product, stock: 0 });
    fixture.detectChanges();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('.add-cart-button');

    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain('Agotado');
  });

  it('debe habilitar el botón de carrito cuando hay existencias', () => {
    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('.add-cart-button');

    expect(button.disabled).toBe(false);
    expect(button.textContent).toContain('Agregar');
  });

  it('debe ejecutar la acción de favoritos desde el botón', () => {
    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('.favorite-button');

    button.click();

    expect(cartService.isFavorite(product.id)).toBe(true);
    expect(notificationService.notify)
      .toHaveBeenCalledWith('Producto agregado a favoritos');
  });

  it('debe ejecutar la acción de agregar desde el botón', () => {
    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('.add-cart-button');

    button.click();

    expect(cartService.items()).toHaveLength(1);
  });
});

