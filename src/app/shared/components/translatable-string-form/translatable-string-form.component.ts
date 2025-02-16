import {Component, EventEmitter, forwardRef, Input, OnInit, Output} from '@angular/core';
import {
  ControlValueAccessor,
  FormArray,
  FormBuilder,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from '@angular/forms';
import {TranslatableString} from '@models/api.models';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

@Component({
  selector: 'app-translatable-string-form',
  templateUrl: './translatable-string-form.component.html',
  styleUrls: ['./translatable-string-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TranslatableStringFormComponent),
      multi: true
    }
  ]
})
export class TranslatableStringFormComponent implements OnInit, ControlValueAccessor {
  @Input() set translations(value: TranslatableString[]) {
    if (JSON.stringify(this._translations) !== JSON.stringify(value)) {
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
    {code: 'fr', name: 'Français'},
    {code: 'en', name: 'English'},
    {code: 'de', name: 'Deutsch'},
    {code: 'es', name: 'Español'},
    {code: 'it', name: 'Italiano'}
  ];

  private onChange: (value: TranslatableString[]) => void = () => {
  };
  private onTouched: () => void = () => {
  };

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      translations: this.fb.array([])
    });
  }

  ngOnInit() {
    this.initForm();

    this.form.valueChanges.subscribe(() => {
      const translations = this.form.value.translations as TranslatableString[];
      if (JSON.stringify(translations) !== JSON.stringify(this._translations)) {
        this.emitChanges();
      }
    });
  }

  writeValue(value: TranslatableString[]): void {
    if (value) {
      this._translations = value;
      this.initForm();
    }
  }

  registerOnChange(fn: (value: TranslatableString[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  get translationsArray() {
    return this.form.get('translations') as FormArray;
  }

  private initForm() {
    while (this.translationsArray.length) {
      this.translationsArray.removeAt(0);
    }

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
      this.onTouched();
    }
  }

  removeTranslation(index: number) {
    this.translationsArray.removeAt(index);
    this.onTouched();
  }

  private emitChanges() {
    const translations = this.form.value.translations as TranslatableString[];
    this._translations = [...translations];
    this.translationsChange.emit(translations);
    this.onChange(translations);
    this.onTouched();
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
