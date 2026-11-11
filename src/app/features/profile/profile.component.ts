import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../core/services/profile.service';
import { UserProfile } from '../../models/profile.model';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(ProfileService);

  readonly profile = signal<UserProfile | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly uploading = signal(false);
  readonly deletingAvatar = signal(false);
  readonly message = signal('');
  readonly errorMessage = signal('');
  readonly avatarUrl = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    displayName: ['', Validators.maxLength(150)],
    email: ['', [Validators.email, Validators.maxLength(150)]],
    phone: ['', Validators.maxLength(30)],
    address: ['', Validators.maxLength(255)]
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.clearAvatarUrl();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.profileService.getProfile().subscribe({
      next: profile => {
        this.profile.set(profile);
        this.form.patchValue({
          displayName: profile.displayName ?? '',
          email: profile.email ?? '',
          phone: profile.phone ?? '',
          address: profile.address ?? ''
        });
        this.loading.set(false);

        if (profile.hasAvatar) {
          this.loadAvatar();
        } else {
          this.clearAvatarUrl();
        }
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('No fue posible cargar tu perfil. Intenta nuevamente.');
      }
    });
  }

  saveProfile(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.message.set('');
    this.errorMessage.set('');

    this.profileService.updateProfile(this.form.getRawValue()).subscribe({
      next: profile => {
        this.profile.set(profile);
        this.saving.set(false);
        this.message.set('Tus datos se guardaron correctamente.');
      },
      error: () => {
        this.saving.set(false);
        this.errorMessage.set('No se pudieron guardar los cambios.');
      }
    });
  }

  async onAvatarSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.message.set('');
    this.errorMessage.set('');

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorMessage.set('Selecciona un archivo de imagen válido.');
      input.value = '';
      return;
    }

    this.uploading.set(true);

    try {
      const webp = await this.convertToWebP(file);

      if (webp.size > 1024 * 1024) {
        throw new Error('La imagen convertida supera el límite de 1 MB.');
      }

      this.profileService.uploadAvatar(webp).subscribe({
        next: profile => {
          this.profile.set(profile);
          this.loadAvatar();
          this.uploading.set(false);
          this.message.set('Tu fotografía de perfil fue actualizada.');
          input.value = '';
        },
        error: () => {
          this.uploading.set(false);
          this.errorMessage.set('No se pudo subir la fotografía.');
          input.value = '';
        }
      });
    } catch (error) {
      this.uploading.set(false);
      this.errorMessage.set(
        error instanceof Error
          ? error.message
          : 'No fue posible procesar la imagen.'
      );
      input.value = '';
    }
  }

  private async convertToWebP(file: File): Promise<Blob> {
    const bitmap = await createImageBitmap(file);
    const maxDimension = 512;
    const scale = Math.min(
      1,
      maxDimension / Math.max(bitmap.width, bitmap.height)
    );

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));

    const context = canvas.getContext('2d');
    if (!context) {
      bitmap.close();
      throw new Error('No se pudo procesar la imagen en el navegador.');
    }

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob || blob.type !== 'image/webp') {
          reject(new Error('El navegador no pudo convertir la imagen a WebP.'));
          return;
        }
        resolve(blob);
      }, 'image/webp', 0.82);
    });
  }

  private loadAvatar(): void {
    this.profileService.getAvatar().subscribe({
      next: blob => {
        this.clearAvatarUrl();
        this.avatarUrl.set(URL.createObjectURL(blob));
      },
      error: () => {
        this.clearAvatarUrl();
      }
    });
  }

  removeAvatar(): void {
    this.deletingAvatar.set(true);
    this.message.set('');
    this.errorMessage.set('');

    this.profileService.deleteAvatar().subscribe({
      next: () => {
        this.clearAvatarUrl();
        const current = this.profile();
        if (current) {
          this.profile.set({ ...current, hasAvatar: false });
        }
        this.deletingAvatar.set(false);
        this.message.set('Fotografía eliminada correctamente.');
      },
      error: () => {
        this.deletingAvatar.set(false);
        this.errorMessage.set('No se pudo eliminar la fotografía.');
      }
    });
  }

  private clearAvatarUrl(): void {
    const currentUrl = this.avatarUrl();
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
      this.avatarUrl.set(null);
    }
  }
}