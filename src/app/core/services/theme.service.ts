import { Injectable, effect, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly darkMode = signal(
    typeof window !== 'undefined' &&
    window.localStorage.getItem('huellas-theme') === 'dark'
  );

  constructor() {
    effect(() => {
      const dark = this.darkMode();

      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', dark);
      }

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          'huellas-theme',
          dark ? 'dark' : 'light'
        );
      }
    });
  }

  toggle(): void {
    this.darkMode.update(value => !value);
  }
}
