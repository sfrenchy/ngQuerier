import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LabelCardConfig } from './label-card.config';
import { CardDto, TranslatableString } from '@models/api.models';
import { TranslatableStringFormComponent } from '@shared/components/translatable-string-form/translatable-string-form.component';
import { TranslateModule } from '@ngx-translate/core';
import { ValidationError } from '@cards/validation/validation.models';

@Component({
  selector: 'app-label-card-configuration',
  templateUrl: './label-card-configuration.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatableStringFormComponent,
    TranslateModule
  ]
})
export class LabelCardConfigurationComponent implements OnInit {
  @Input() card!: CardDto<LabelCardConfig>;
  @Input() set validationErrors(errors: ValidationError[]) {
    this._validationErrors = errors;
  }
  get validationErrors(): ValidationError[] {
    return this._validationErrors;
  }
  private _validationErrors: ValidationError[] = [];
  @Output() save = new EventEmitter<LabelCardConfig>();
  @Output() configChange = new EventEmitter<LabelCardConfig>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      text: [[] as TranslatableString[]],
      fontSize: [16],
      fontWeight: ['normal'],
      textAlign: ['left']
    });

    // Émettre les changements dès que le formulaire change
    this.form.valueChanges.subscribe((value: any) => {
      if (this.form.valid) {
        const config = new LabelCardConfig();
        config.content.text = value.text || [];
        config.content.fontSize = value.fontSize;
        config.content.fontWeight = value.fontWeight;
        config.content.textAlign = value.textAlign;
        this.configChange.emit(config);
      }
    });
  }

  ngOnInit() {
    if (this.card.configuration) {
      this.form.patchValue({
        text: this.card.configuration.content.text || [],
        fontSize: this.card.configuration.content.fontSize || 16,
        fontWeight: this.card.configuration.content.fontWeight || 'normal',
        textAlign: this.card.configuration.content.textAlign || 'left'
      }, { emitEvent: false }); // Ne pas émettre lors de l'initialisation
    }
  }

  // Méthode pour la sauvegarde finale
  onSave() {
    if (this.form.valid) {
      const config = new LabelCardConfig();
      config.content.text = this.form.value.text || [];
      config.content.fontSize = this.form.value.fontSize;
      config.content.fontWeight = this.form.value.fontWeight;
      config.content.textAlign = this.form.value.textAlign;
      this.save.emit(config);
    }
  }

  getControlErrors(controlPath: string): ValidationError[] {
    return this.validationErrors.filter(error => error.controlPath === controlPath);
  }
}
