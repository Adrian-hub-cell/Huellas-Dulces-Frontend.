
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-customer-register',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="form-page">
      <a routerLink="/" class="back-link">← Volver al catálogo</a>

      <div class="form-heading">
        <span class="eyebrow">BIENVENIDO A HUELLAS DULCES</span>
        <h1>Crear mi cuenta</h1>
        <p>Regístrate para disfrutar de nuestra tienda y gestionar tus compras.</p>
      </div>

      <form class="product-form" [formGroup]="form" (ngSubmit)="submit()">

        <label>
          Nombre
          <input formControlName="firstName" placeholder="Tu nombre" autocomplete="given-name">
          @if (form.controls.firstName.touched && form.controls.firstName.invalid) {
            <small class="field-error">El nombre es obligatorio.</small>
          }
        </label>

        <label>
          Apellido
          <input formControlName="lastName" placeholder="Tu apellido" autocomplete="family-name">
          @if (form.controls.lastName.touched && form.controls.lastName.invalid) {
            <small class="field-error">El apellido es obligatorio.</small>
          }
        </label>

        <label>
          Número de identificación
          <input formControlName="identificationNumber" placeholder="Tu número de identificación">
          @if (form.controls.identificationNumber.touched && form.controls.identificationNumber.invalid) {
            <small class="field-error">La identificación es obligatoria.</small>
          }
        </label>

        <label>
          Correo electrónico
          <input type="email" formControlName="email" placeholder="correo@ejemplo.com" autocomplete="email">
          @if (form.controls.email.touched && form.controls.email.invalid) {
            <small class="field-error">Escribe un correo electrónico válido.</small>
          }
        </label>

        <label>
          Teléfono
          <input type="tel" formControlName="phone" placeholder="Tu número de teléfono" autocomplete="tel">
          @if (form.controls.phone.touched && form.controls.phone.invalid) {
            <small class="field-error">El teléfono es obligatorio.</small>
          }
        </label>

        <label>
          Dirección
          <input formControlName="address" placeholder="Tu dirección (opcional)" autocomplete="street-address">
        </label>

        <label>
          Nombre de usuario
          <input formControlName="username" placeholder="Mínimo 4 caracteres" autocomplete="username">
          @if (form.controls.username.touched && form.controls.username.invalid) {
            <small class="field-error">El usuario debe tener entre 4 y 80 caracteres.</small>
          }
        </label>

        <label>
          Contraseña
          <input type="password" formControlName="password" placeholder="Mínimo 8 caracteres" autocomplete="new-password">
          @if (form.controls.password.touched && form.controls.password.invalid) {
            <small class="field-error">La contraseña debe tener al menos 8 caracteres.</small>
          }
        </label>

        @if (errorMessage()) {
          <p class="field-error">{{ errorMessage() }}</p>
        }

        <button class="primary-button" type="submit" [disabled]="loading()">
          {{ loading() ? 'Creando cuenta...' : 'Crear cuenta' }}
        </button>

        <p>¿Ya tienes una cuenta? <a routerLink="/login">Inicia sesión</a></p>
      </form>
    </section>
  `
})
export class CustomerRegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    identificationNumber: ['', [Validators.required, Validators.maxLength(30)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    phone: ['', [Validators.required, Validators.maxLength(30)]],
    address: ['', Validators.maxLength(255)],
    username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(80)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.auth.registerCustomer(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.loading.set(false);
        alert(response.message);
        this.router.navigate(['/login']);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          error.error?.detail ||
          error.error?.message ||
          'No fue posible crear la cuenta. Verifica los datos e inténtalo nuevamente.'
        );
      }
    });
  }
}
