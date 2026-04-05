import { Injectable, signal } from '@angular/core';
import en from './translations/en.json';
import id from './translations/id.json';

export type AppLanguage = 'en' | 'id';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private translations: Record<string, any> = { en, id };
  readonly currentLang = signal<AppLanguage>(this.getStoredLang());

  private getStoredLang(): AppLanguage {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('app-lang');
      if (stored === 'en' || stored === 'id') return stored;
    }
    return 'en';
  }

  setLanguage(lang: AppLanguage): void {
    this.currentLang.set(lang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('app-lang', lang);
    }
  }

  toggleLanguage(): void {
    this.setLanguage(this.currentLang() === 'en' ? 'id' : 'en');
  }

  t(key: string): string {
    const keys = key.split('.');
    let value: any = this.translations[this.currentLang()];
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    return typeof value === 'string' ? value : key;
  }
}
