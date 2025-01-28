import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { StoredProcedureParameter, ParameterType } from '@models/parameters.models';

@Component({
  selector: 'app-chart-parameters-panel',
  templateUrl: './chart-parameters-panel.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule]
})
export class ChartParametersPanelComponent implements OnInit {
  @Input() parameters: StoredProcedureParameter[] = [];
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() parameterChange = new EventEmitter<StoredProcedureParameter[]>();

  form: FormGroup;
  readonly parameterTypes: ParameterType[] = ['string', 'number', 'date', 'boolean', 'array'];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({});
  }

  ngOnInit() {
    console.log('[ChartParametersPanel] Initialisation:', {
      parameters: this.parameters,
      isOpen: this.isOpen
    });
    this.initForm();
  }

  private initForm() {
    console.log('[ChartParametersPanel] Initialisation du formulaire');
    // Créer un contrôle pour chaque paramètre
    this.parameters.forEach(param => {
      if (param.userChangeAllowed) {
        this.form.addControl(param.name, this.fb.control(param.value));
      }
    });

    // S'abonner aux changements
    this.form.valueChanges.subscribe(values => {
      console.log('[ChartParametersPanel] Changement de valeur:', values);
      const updatedParameters = this.parameters.map(param => ({
        ...param,
        value: param.userChangeAllowed ? values[param.name] : param.value
      }));
      this.parameterChange.emit(updatedParameters);
    });
  }

  togglePanel(): void {
    console.log('[ChartParametersPanel] Toggle panneau:', {
      currentState: this.isOpen,
      newState: !this.isOpen
    });
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen);
  }

  getInputType(paramType: string): string {
    switch (paramType.toLowerCase()) {
      case 'number':
        return 'number';
      case 'date':
        return 'date';
      case 'boolean':
        return 'checkbox';
      default:
        return 'text';
    }
  }

  // Méthode utilitaire pour formater les valeurs de date
  formatDateValue(value: any): string {
    if (!value) return '';
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    return value;
  }
} 