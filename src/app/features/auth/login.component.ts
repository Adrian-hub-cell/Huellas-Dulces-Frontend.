import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { RealtimeService } from '../../core/services/realtime.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="form-page login-page">
      <a routerLink="/" class="back-link">← Volver al catálogo</a>

      <div class="form-heading">
        <span class="eyebrow">BIENVENIDO DE NUEVO</span>
        <h1>Iniciar sesión</h1>
        <p>Ingresa con tu cuenta para gestionar el catálogo.</p>
      </div>

      <form class="product-form" [formGroup]="form" (ngSubmit)="submit()">
        <label>
          Usuario
          <input formControlName="username" autocomplete="username"
            placeholder="Nombre de usuario">
          @if (form.controls.username.touched && form.controls.username.invalid) {
            <small class="field-error">Escribe tu usuario.</small>
          }
        </label>

        <label>
          Contraseña
          <input type="password" formControlName="password"
            autocomplete="current-password" placeholder="Tu contraseña">
          @if (form.controls.password.touched && form.controls.password.invalid) {
            <small class="field-error">Escribe tu contraseña.</small>
          }
        </label>

        @if (errorMessage()) {
          <p class="field-error">{{ errorMessage() }}</p>
        }

        <button class="primary-button" type="submit" [disabled]="loading()">
          {{ loading() ? 'Ingresando...' : 'Ingresar' }}
        </button>

        <p>
          ¿No tienes una cuenta?
          <a routerLink="/crear-cuenta">Crear una cuenta</a>
        </p>
      </form>
    </section>
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly realtime = inject(RealtimeService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.realtime.connect();
        this.notifications.notify('Sesión iniciada correctamente');
        this.router.navigate(['/']);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Usuario o contraseña incorrectos, o backend no disponible.');
      }
    });
  }
}
