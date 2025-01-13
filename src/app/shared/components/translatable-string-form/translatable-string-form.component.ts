import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatableString } from '@models/api.models';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-translatable-string-form',
  templateUrl: './translatable-string-form.component.html',
  styleUrls: ['./translatable-string-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule
  ]
})
export class TranslatableStringFormComponent implements OnInit {
  @Input() set translations(value: TranslatableString[]) {
    if (JSON.stringify(this._translations) !== JSON.stringify(value)) {
      console.log('Translations input received:', value);
      this._translations = value;
      if (this.form) {
        this.initForm();
      }
    }
  }
  get translations(): TranslatableString[] {
    return this._translations;
  }
  private _translations: TranslatableString[] = [];

  @Output() translationsChange = new EventEmitter<TranslatableString[]>();

  form: FormGroup;
  availableLanguages = [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
    { code: 'es', name: 'Español' },
    { code: 'it', name: 'Italiano' }
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      translations: this.fb.array([])
    });
  }

  ngOnInit() {
    console.log('Component initialized with translations:', this.translations);
    this.initForm();

    // Utiliser debounceTime pour éviter trop de mises à jour
    this.form.valueChanges.subscribe(() => {
      const translations = this.form.value.translations as TranslatableString[];
      if (JSON.stringify(translations) !== JSON.stringify(this._translations)) {
        this.emitChanges();
      }
    });
  }

  get translationsArray() {
    return this.form.get('translations') as FormArray;
  }

  private initForm() {
    console.log('Initializing form with translations:', this.translations);
    // Clear existing translations
    while (this.translationsArray.length) {
      this.translationsArray.removeAt(0);
    }

    // Add existing translations
    this.translations.forEach(translation => {
      this.translationsArray.push(
        this.fb.group({
          languageCode: [translation.languageCode],
          value: [translation.value]
        })
      );
    });
  }

  addTranslation() {
    const usedLanguages = this.translationsArray.value.map((t: TranslatableString) => t.languageCode);
    const availableLanguage = this.availableLanguages.find(lang => 
      !usedLanguages.includes(lang.code)
    );

    if (availableLanguage) {
      this.translationsArray.push(
        this.fb.group({
          languageCode: [availableLanguage.code],
          value: ['']
        })
      );
    }
  }

  removeTranslation(index: number) {
    this.translationsArray.removeAt(index);
  }

  private emitChanges() {
    const translations = this.form.value.translations as TranslatableString[];
    console.log('Emitting translations:', translations);
    this._translations = [...translations];
    this.translationsChange.emit(translations);
  }

  getLanguageName(code: string): string {
    return this.availableLanguages.find(lang => lang.code === code)?.name || code;
  }

  getAvailableLanguagesForIndex(index: number): { code: string, name: string }[] {
    const usedLanguages = this.translationsArray.value
      .map((t: TranslatableString) => t.languageCode)
      .filter((_: string, i: number) => i !== index);
    
    return this.availableLanguages.filter(lang => !usedLanguages.includes(lang.code));
  }
}
