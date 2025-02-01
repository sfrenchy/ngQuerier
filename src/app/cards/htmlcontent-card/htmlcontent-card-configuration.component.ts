import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HTMLContentCardConfig } from './htmlcontent-card.config';
import { CardDto } from '@models/api.models';
import { TranslateModule } from '@ngx-translate/core';
import { ValidationError } from '@cards/validation/validation.models';
import { AngularEditorModule, AngularEditorConfig } from '@kolkov/angular-editor';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-htmlcontent-card-configuration',
  templateUrl: './htmlcontent-card-configuration.component.html',
  styleUrls: ['./htmlcontent-card-configuration.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    AngularEditorModule,
    HttpClientModule
  ]
})
export class HTMLContentCardConfigurationComponent implements OnInit {
  @Input() card!: CardDto<HTMLContentCardConfig>;
  @Input() set validationErrors(errors: ValidationError[]) {
    this._validationErrors = errors;
  }
  get validationErrors(): ValidationError[] {
    return this._validationErrors;
  }
  private _validationErrors: ValidationError[] = [];
  @Output() save = new EventEmitter<HTMLContentCardConfig>();
  @Output() configChange = new EventEmitter<HTMLContentCardConfig>();

  form: FormGroup;
  currentLanguage = 'fr';
  availableLanguages = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' }
  ];

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '300px',
    minHeight: '200px',
    maxHeight: '400px',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Enter text here...',
    defaultParagraphSeparator: 'p',
    defaultFontName: '',
    defaultFontSize: '',
    toolbarPosition: 'top',
    toolbarHiddenButtons: [
      [
        'subscript',
        'superscript',
        'fontName',
        'fontSize',
        'backgroundColor',
        'customClasses',
        'insertVideo',
        'insertHorizontalRule',
        'toggleEditorMode'
      ]
    ],
    customClasses: [],
    sanitize: false,
    fonts: [
      {class: 'arial', name: 'Arial'},
      {class: 'times-new-roman', name: 'Times New Roman'},
      {class: 'calibri', name: 'Calibri'}
    ]
  };

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      htmlContent: ['']
    });

    this.form.valueChanges.subscribe(() => {
      if (this.form.valid) {
        this.updateConfig();
      }
    });
  }

  ngOnInit() {
    if (this.card.configuration) {
      const content = this.card.configuration.content.html?.find(t => t.languageCode === this.currentLanguage);
      this.form.patchValue({
        htmlContent: content?.value || ''
      }, { emitEvent: false });
    }
  }

  onLanguageChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const langCode = select.value;

    // Save current content before switching
    this.saveCurrentContent();

    this.currentLanguage = langCode;
    // Load content for new language
    const content = this.card.configuration?.content.html?.find(t => t.languageCode === langCode);
    this.form.patchValue({
      htmlContent: content?.value || ''
    }, { emitEvent: false });
  }

  private saveCurrentContent() {
    if (this.form.valid) {
      this.updateConfig();
    }
  }

  private updateConfig() {
    const config = new HTMLContentCardConfig();
    const existingContent = this.card.configuration?.content.html || [];

    const htmlContent = this.form.value.htmlContent;
    const existingIndex = existingContent.findIndex(t => t.languageCode === this.currentLanguage);

    if (existingIndex >= 0) {
      existingContent[existingIndex].value = htmlContent;
    } else {
      existingContent.push({ languageCode: this.currentLanguage, value: htmlContent });
    }

    config.content.html = existingContent;
    this.configChange.emit(config);
  }

  getControlErrors(controlPath: string): ValidationError[] {
    return this.validationErrors.filter(error => error.controlPath === controlPath);
  }
}
