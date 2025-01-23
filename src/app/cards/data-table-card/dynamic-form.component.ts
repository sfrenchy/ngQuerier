import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicFormField, DynamicFormSchema } from './data-table-card.models';
import { ForeignKeyService } from './foreign-key.service';

export interface FormDataSubmit {
    schema: DynamicFormSchema;
    formData: any;
}

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [class]="isFullscreen ? 'fixed inset-0 z-50 p-4' : 'relative h-[600px]'" class="flex">
      <div class="flex flex-col w-full bg-gray-800 rounded-lg shadow-lg">
        <!-- Zone de défilement pour les champs -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex-1 min-h-0 overflow-auto">
          <div class="space-y-4 p-4">
            <div *ngFor="let field of fields" class="space-y-2">
              <label [for]="field.key" class="block text-sm font-medium text-gray-200">
                {{field.label}}
                <span *ngIf="field.required" class="text-red-500">*</span>
              </label>

              <!-- Select pour les clés étrangères -->
              <select *ngIf="field.metadata?.isForeignKey && !field.isNavigation"
                [id]="field.key"
                [formControlName]="field.key"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                [class.border-red-500]="form.get(field.key)?.invalid && form.get(field.key)?.touched">
                <option [ngValue]="null" *ngIf="field.nullable">Sélectionnez une valeur...</option>
                <option *ngFor="let option of getForeignKeyOptions(field)" [ngValue]="option.id">
                  {{ option.display }}
                </option>
              </select>

              <!-- Input pour les champs texte -->
              <input *ngIf="field.type === 'string' && !field.isNavigation && !field.metadata?.isForeignKey"
                [id]="field.key"
                [type]="field.inputType"
                [formControlName]="field.key"
                [maxLength]="field.maxLength"
                [placeholder]="getPlaceholder(field)"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                [class.border-red-500]="form.get(field.key)?.invalid && form.get(field.key)?.touched"
              >

              <!-- Input pour les champs nombre -->
              <input *ngIf="(field.type === 'number' || field.type === 'integer') && !field.metadata?.isForeignKey"
                [id]="field.key"
                type="number"
                [formControlName]="field.key"
                [step]="field.type === 'number' ? '0.01' : '1'"
                [placeholder]="getPlaceholder(field)"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                [class.border-red-500]="form.get(field.key)?.invalid && form.get(field.key)?.touched"
              >

              <!-- Input pour les dates -->
              <input *ngIf="field.type === 'date' && !field.metadata?.isForeignKey"
                [id]="field.key"
                type="datetime-local"
                [formControlName]="field.key"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                [class.border-red-500]="form.get(field.key)?.invalid && form.get(field.key)?.touched"
              >

              <!-- Message d'erreur -->
              <div *ngIf="form.get(field.key)?.invalid && form.get(field.key)?.touched" 
                   class="text-sm text-red-500 mt-1">
                <span *ngIf="form.get(field.key)?.errors?.['required']">Ce champ est requis</span>
                <span *ngIf="form.get(field.key)?.errors?.['maxlength']">
                  La longueur maximale est de {{field.maxLength}} caractères
                </span>
                <span *ngIf="form.get(field.key)?.errors?.['min']">
                  La valeur minimale est {{getMinValue(field)}}
                </span>
                <span *ngIf="form.get(field.key)?.errors?.['max']">
                  La valeur maximale est {{getMaxValue(field)}}
                </span>
              </div>

              <!-- Description du champ -->
              <div *ngIf="getFieldDescription(field)" class="text-xs text-gray-400 mt-1">
                {{ getFieldDescription(field) }}
              </div>
            </div>
          </div>
        </form>

        <!-- Pied de page fixe -->
        <div class="flex-none p-4 border-t border-gray-700 bg-gray-800">
          <div class="flex justify-end space-x-3">
            <button type="button" 
                    (click)="onCancel()"
                    class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              Annuler
            </button>
            <button type="submit"
                    (click)="onSubmit()"
                    [disabled]="!form.valid"
                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DynamicFormComponent implements OnInit {
  @Input() jsonSchema!: DynamicFormSchema;
  @Input() foreignKeyData?: { [key: string]: any[] };
  @Input() foreignKeyConfigs?: { [key: string]: any };
  @Input() initialData?: { [key: string]: any };
  @Output() formSubmit = new EventEmitter<FormDataSubmit>();
  @Output() formCancel = new EventEmitter<void>();
  @Output() fullscreenChange = new EventEmitter<boolean>();

  form!: FormGroup;
  fields: DynamicFormField[] = [];
  private identityFields: { key: string; defaultValue: any; }[] = [];
  isFullscreen = false;
  private foreignKeyOptions: { [key: string]: any[] } = {};

  constructor(
    private fb: FormBuilder,
    private foreignKeyService: ForeignKeyService
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    const formGroup: any = {};
    const properties = this.jsonSchema.properties;

    // Stocker les champs Identity/PrimaryKey
    this.identityFields = Object.keys(properties)
      .filter(key => {
        const metadata = properties[key]['x-entity-metadata'];
        return metadata?.isPrimaryKey && metadata?.isIdentity;
      })
      .map(key => ({
        key,
        defaultValue: properties[key]['x-entity-metadata']?.defaultValue ?? null
      }));

    // Filtrer les champs pour le formulaire (exclure Identity/PrimaryKey)
    this.fields = Object.keys(properties)
      .filter(key => {
        const metadata = properties[key]['x-entity-metadata'];
        return !metadata?.isNavigation && 
               !metadata?.isCollection && 
               !(metadata?.isPrimaryKey && metadata?.isIdentity);
      })
      .map(key => {
        const prop = properties[key];
        const metadata = prop['x-entity-metadata'];
        
        // Créer le contrôle de formulaire avec les validateurs
        const validators = [];
        if (metadata?.isRequired) {
          validators.push(Validators.required);
        }
        if (prop.maxLength) {
          validators.push(Validators.maxLength(prop.maxLength));
        }
        if (prop.type === 'number' || prop.type === 'integer') {
          if (prop.minimum !== undefined) {
            validators.push(Validators.min(prop.minimum));
          }
          if (prop.maximum !== undefined) {
            validators.push(Validators.max(prop.maximum));
          }
        }

        // Utiliser la valeur initiale si disponible, sinon la valeur par défaut
        const defaultValue = this.initialData?.[key] ?? metadata?.defaultValue ?? null;
        formGroup[key] = [defaultValue, validators];

        return {
          key,
          label: this.formatLabel(key),
          type: prop.type,
          required: metadata?.isRequired || false,
          maxLength: prop.maxLength,
          inputType: this.getInputType(prop),
          isNavigation: metadata?.isNavigation || false,
          defaultValue: defaultValue,
          nullable: prop.nullable,
          metadata: metadata,
          minimum: prop.minimum,
          maximum: prop.maximum
        };
      });

    this.form = this.fb.group(formGroup);
  }

  private formatLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }

  private getInputType(prop: any): string {
    const type = prop.type;
    const format = prop.format;
    const metadata = prop['x-entity-metadata'];

    if (type === 'string') {
      if (format === 'date-time' || metadata?.columnType?.includes('datetime')) {
        return 'datetime-local';
      }
      if (metadata?.columnType?.includes('date')) {
        return 'date';
      }
      if (metadata?.columnType?.includes('time')) {
        return 'time';
      }
      return 'text';
    }
    if (type === 'number' || type === 'integer') {
      return 'number';
    }
    return 'text';
  }

  getPlaceholder(field: DynamicFormField): string {
    if (field.required) {
      return `Entrez ${field.label.toLowerCase()}`;
    }
    return `${field.label} (optionnel)`;
  }

  getFieldDescription(field: DynamicFormField): string {
    const descriptions: string[] = [];

    if (field.metadata?.isForeignKey) {
      descriptions.push(`Référence à ${field.metadata.foreignKeyTable}`);
    }

    if (field.type === 'string' && field.maxLength) {
      descriptions.push(`Maximum ${field.maxLength} caractères`);
    }

    if (field.metadata?.columnType) {
      descriptions.push(`Type: ${field.metadata.columnType}`);
    }

    return descriptions.join(' • ');
  }

  getMinValue(field: DynamicFormField): number {
    if (field.type === 'integer') {
      return field.metadata?.columnType?.includes('unsigned') ? 0 : Number.MIN_SAFE_INTEGER;
    }
    return Number.MIN_SAFE_INTEGER;
  }

  getMaxValue(field: DynamicFormField): number {
    return Number.MAX_SAFE_INTEGER;
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;

      // Ajouter les valeurs par défaut des champs Identity
      this.identityFields.forEach(field => {
        formValue[field.key] = field.defaultValue;
      });

      // Formatter les dates et gérer les valeurs nulles
      Object.keys(formValue).forEach(key => {
        const field = this.fields.find(f => f.key === key);
        if (field?.inputType === 'datetime-local' && formValue[key]) {
          formValue[key] = new Date(formValue[key]).toISOString();
        }
        if (formValue[key] === '') {
          formValue[key] = null;
        }
      });

      this.formSubmit.emit({ 
        schema: this.jsonSchema,
        formData: formValue 
      });
    }
  }

  onCancel() {
    this.formCancel.emit();
  }

  getForeignKeyOptions(field: DynamicFormField): any[] {
    if (!field.metadata?.foreignKeyTable || !field.metadata?.foreignKeyColumn) {
      return [];
    }

    const tableName = field.metadata.foreignKeyTable;
    const foreignKeyColumn = field.metadata.foreignKeyColumn;
    const config = this.foreignKeyConfigs?.[tableName];
    const data = this.foreignKeyData?.[tableName] || [];

    return data.map(item => {
      const id = item && typeof item === 'object' ? item[foreignKeyColumn] : null;
      return {
        id,
        display: config ? this.foreignKeyService.formatDisplay(
          item,
          config.displayColumns || [],
          config.displayFormat
        ) : String(id ?? '')
      };
    });
  }

  formatForeignKeyLabel(tableName: string, item: any): string {
    const config = this.foreignKeyConfigs?.[tableName];
    if (!config?.displayColumns?.length) {
      // Si pas de configuration, utiliser l'ID comme fallback
      const tableNameCamel = tableName.charAt(0).toLowerCase() + tableName.slice(1);
      return item[tableNameCamel + 'Id']?.toString() || '';
    }

    return config.displayColumns
      .map((col: string) => item[col])
      .filter((val: any) => val != null)
      .join(config.displayFormat || ' - ');
  }

  getForeignKeyDisplay(option: any, config?: any): string {
    if (!config?.displayFormat) {
      // Fallback : afficher la première propriété non technique
      const firstDisplayableProperty = Object.keys(option).find(key => 
        !key.toLowerCase().includes('id') && 
        typeof option[key] === 'string'
      );
      if (!firstDisplayableProperty) return option.toString();
      return option[firstDisplayableProperty];
    }

    return config.displayFormat.replace(/\{([^}]+)\}/g, (match: string, key: string) => {
      return option[key] ?? '';
    });
  }

  getForeignKeyConfig(field: DynamicFormField): any {
    if (field.metadata?.foreignKeyTable && this.foreignKeyConfigs) {
      return this.foreignKeyConfigs[field.metadata.foreignKeyTable];
    }
    return undefined;
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
    this.fullscreenChange.emit(this.isFullscreen);
  }
} 