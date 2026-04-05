import { Injectable, signal, effect } from '@angular/core';

export type AppTheme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly currentTheme = signal<AppTheme>(this.getStoredTheme());

  constructor() {
    effect(() => {
      this.applyTheme(this.currentTheme());
    });
    // Apply immediately
    this.applyTheme(this.currentTheme());
  }

  private getStoredTheme(): AppTheme {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('app-theme');
      if (stored === 'light' || stored === 'dark') return stored;
    }
    // Default to dark
    return 'dark';
  }

  setTheme(theme: AppTheme): void {
    this.currentTheme.set(theme);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('app-theme', theme);
    }
  }

  toggleTheme(): void {
    this.setTheme(this.currentTheme() === 'dark' ? 'light' : 'dark');
  }

  isDark(): boolean {
    return this.currentTheme() === 'dark';
  }

  private applyTheme(theme: AppTheme): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }
}
