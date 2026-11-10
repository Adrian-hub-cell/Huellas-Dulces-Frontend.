import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-product-register',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="form-page">
      <a routerLink="/" class="back-link">← Volver al catálogo</a>

      <div class="form-heading">
        <span class="eyebrow">ADMINISTRACIÓN DEL CATÁLOGO</span>
        <h1>Registrar un producto</h1>
        <p>Agrega un nuevo producto para los consentidos de la casa.</p>
      </div>

      <form class="product-form" [formGroup]="form" (ngSubmit)="submit()">
        <label>
          Nombre del producto
          <input formControlName="name" placeholder="Ej. Croquetas para perro">
          @if (form.controls.name.touched && form.controls.name.invalid) {
            <small class="field-error">El nombre es obligatorio y debe tener al menos 3 caracteres.</small>
          }
        </label>

        <label>
          Descripción
          <textarea formControlName="description" rows="3"
            placeholder="Describe el producto"></textarea>
          @if (form.controls.description.touched && form.controls.description.invalid) {
            <small class="field-error">La descripción es obligatoria.</small>
          }
        </label>

        <label>
          Categoría
          <select formControlName="category">
            <option value="">Selecciona una categoría</option>
            <option value="Alimento para perros">Alimento para perros</option>
            <option value="Alimento para gatos">Alimento para gatos</option>
            <option value="Snacks">Snacks</option>
            <option value="Higiene">Higiene</option>
            <option value="Accesorios">Accesorios</option>
          </select>
          @if (form.controls.category.touched && form.controls.category.invalid) {
            <small class="field-error">Selecciona una categoría.</small>
          }
        </label>

        <div class="form-row">
          <label>
            Precio (COP)
            <input type="number" min="0.01" step="0.01"
              formControlName="price" placeholder="25000">
            @if (form.controls.price.touched && form.controls.price.invalid) {
              <small class="field-error">El precio debe ser mayor que cero.</small>
            }
          </label>

          <label>
            Stock inicial
            <input type="number" min="0" step="1"
              formControlName="stock" placeholder="10">
            @if (form.controls.stock.touched && form.controls.stock.invalid) {
              <small class="field-error">El stock no puede ser negativo.</small>
            }
          </label>
        </div>

        @if (errorMessage()) {
          <p class="field-error">{{ errorMessage() }}</p>
        }

        <button class="primary-button" type="submit" [disabled]="saving()">
          {{ saving() ? 'Guardando...' : 'Guardar producto' }}
        </button>
      </form>
    </section>
  `
})
export class ProductRegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly products = inject(ProductService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly saving = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.maxLength(500)]],
    category: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0)]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    this.products.createProduct(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.notifications.notify('Producto registrado correctamente');
        this.router.navigate(['/']);
      },
      error: () => {
        this.saving.set(false);
        this.errorMessage.set(
          'No se pudo registrar. Verifica tu sesión ADMIN y que el backend esté activo.'
        );
      }
    });
  }
}
