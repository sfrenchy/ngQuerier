import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {BehaviorSubject} from 'rxjs';

export interface Language {
  code: string;
  name: string;
  flag: string;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<string>('en');
  currentLanguage$ = this.currentLanguageSubject.asObservable();

  readonly languages: Language[] = [
    {code: 'en', name: 'English', flag: '🇬🇧'},
    {code: 'fr', name: 'Français', flag: '🇫🇷'}
  ];

  constructor(private translate: TranslateService) {
    // Initialiser avec la langue du navigateur ou la langue par défaut
    const browserLang = translate.getBrowserLang();
    const defaultLang = browserLang && this.languages.some(lang => lang.code === browserLang)
      ? browserLang
      : 'en';

    // Charger la langue depuis le localStorage ou utiliser la langue par défaut
    const savedLang = localStorage.getItem('language') || defaultLang;
    this.setLanguage(savedLang);

    // Configurer le service de traduction
    translate.setDefaultLang('en');
    translate.addLangs(this.languages.map(lang => lang.code));
  }

  setLanguage(langCode: string) {
    if (this.languages.some(lang => lang.code === langCode)) {
      this.translate.use(langCode);
      localStorage.setItem('language', langCode);
      this.currentLanguageSubject.next(langCode);
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }
}
