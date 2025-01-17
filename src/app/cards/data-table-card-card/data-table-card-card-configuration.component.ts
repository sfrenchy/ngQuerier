import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DataTableCardCardConfig, ColumnConfig } from './data-table-card-card.component';
import { CardDto } from '@models/api.models';
import { TileComponent } from '@shared/components/tile/tile.component';
import { DatasourceConfig } from '@models/datasource.models';
import { DatasourceConfigurationComponent } from '@shared/components/datasource-configuration/datasource-configuration.component';

@Component({
  selector: 'app-data-table-card-card-configuration',
  templateUrl: './data-table-card-card-configuration.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    TileComponent,
    DatasourceConfigurationComponent
  ]
})
export class DataTableCardCardConfigurationComponent implements OnInit {
  @Input() card!: CardDto<DataTableCardCardConfig>;
  @Output() save = new EventEmitter<DataTableCardCardConfig>();
  @Output() configChange = new EventEmitter<DataTableCardCardConfig>();

  form: FormGroup;
  jsonSchema: string | null = null;
  columns: ColumnConfig[] = [];
  expandedColumnIndex: number | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      datasource: [null],
      columns: [[]]
    });

    this.form.valueChanges.subscribe((value: any) => {
      if (this.form.valid) {
        const config = new DataTableCardCardConfig();
        Object.assign(config, value);
        this.configChange.emit(config);
      }
    });
  }

  ngOnInit() {
    if (this.card.configuration) {
      this.form.patchValue({
        datasource: this.card.configuration.datasource,
        columns: this.card.configuration.columns || []
      }, { emitEvent: false });
      this.columns = this.card.configuration.columns || [];
    }
  }

  onDatasourceChange(datasource: DatasourceConfig) {
    this.form.patchValue({ datasource }, { emitEvent: true });
  }

  onSchemaChange(schema: string) {
    this.jsonSchema = schema;
    if (this.jsonSchema) {
      try {
        const schemaObj = JSON.parse(this.jsonSchema);
        this.initializeColumns(schemaObj);
      } catch (e) {
        console.error('Error parsing JSON schema:', e);
      }
    }
  }

  private initializeColumns(schema: any) {
    if (schema.properties) {
      const existingColumns = this.columns;
      this.columns = Object.entries(schema.properties)
        .filter(([_, prop]: [string, any]) => !prop['x-entity-metadata']?.isNavigation)
        .map(([key, prop]: [string, any]) => {
          const existingColumn = existingColumns.find(c => c.key === key);
          const isPrimaryOrForeignKey = prop['x-entity-metadata']?.isPrimaryKey || prop['x-entity-metadata']?.isForeignKey;
          return {
            key,
            type: this.getColumnType(prop),
            label: existingColumn?.label || { en: key, fr: key },
            alignment: existingColumn?.alignment || this.getDefaultAlignment(prop.type),
            visible: existingColumn?.visible ?? !isPrimaryOrForeignKey,
            decimals: existingColumn?.decimals ?? (prop.type === 'number' ? 2 : undefined),
            isNavigation: prop['x-entity-metadata']?.isNavigation || false,
            navigationType: prop['x-entity-metadata']?.navigationType,
            isCollection: prop['x-entity-metadata']?.isCollection || false,
            elementType: prop['x-entity-metadata']?.elementType,
            entityMetadata: prop['x-entity-metadata'] ? {
              isPrimaryKey: prop['x-entity-metadata'].isPrimaryKey,
              isIdentity: prop['x-entity-metadata'].isIdentity,
              columnName: prop['x-entity-metadata'].columnName,
              columnType: prop['x-entity-metadata'].columnType,
              defaultValue: prop['x-entity-metadata'].defaultValue,
              isRequired: prop['x-entity-metadata'].isRequired,
              isForeignKey: prop['x-entity-metadata'].isForeignKey,
              foreignKeyTable: prop['x-entity-metadata'].foreignKeyTable,
              foreignKeyColumn: prop['x-entity-metadata'].foreignKeyColumn,
              foreignKeyConstraintName: prop['x-entity-metadata'].foreignKeyConstraintName,
              maxLength: prop['x-entity-metadata'].maxLength
            } : undefined
          };
        });

      this.form.patchValue({ columns: this.columns }, { emitEvent: true });
    }
  }

  private getColumnType(prop: any): string {
    if (prop['x-entity-metadata']?.navigationType) {
      return prop['x-entity-metadata'].navigationType;
    }
    return prop.type;
  }

  private getDefaultAlignment(type: string): 'left' | 'center' | 'right' {
    switch (type) {
      case 'number':
      case 'integer':
        return 'right';
      case 'boolean':
        return 'center';
      default:
        return 'left';
    }
  }

  toggleColumnExpand(index: number) {
    this.expandedColumnIndex = this.expandedColumnIndex === index ? null : index;
  }

  moveColumn(index: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < this.columns.length) {
      const column = this.columns[index];
      this.columns.splice(index, 1);
      this.columns.splice(newIndex, 0, column);
      this.form.patchValue({ columns: this.columns }, { emitEvent: true });
    }
  }

  onInputChange(event: Event, callback: (value: string) => void) {
    const input = event.target as HTMLInputElement;
    callback(input.value);
  }

  onSelectChange(event: Event, callback: (value: string) => void) {
    const select = event.target as HTMLSelectElement;
    callback(select.value);
  }

  onCheckboxChange(event: Event, callback: (checked: boolean) => void) {
    const checkbox = event.target as HTMLInputElement;
    callback(checkbox.checked);
  }

  handleColumnLabelChange(index: number, lang: string, event: Event) {
    this.onInputChange(event, (value) => {
      this.columns[index].label[lang] = value;
      this.form.patchValue({ columns: this.columns }, { emitEvent: true });
    });
  }

  handleColumnAlignmentChange(index: number, event: Event) {
    event.stopPropagation();
    const button = event.currentTarget as HTMLButtonElement;
    const alignment = button.dataset['alignment'] as 'left' | 'center' | 'right';
    
    if (alignment) {
      this.columns[index].alignment = alignment;
      this.form.patchValue({ columns: this.columns }, { emitEvent: true });
    }
  }

  handleColumnDecimalsChange(index: number, event: Event) {
    this.onInputChange(event, (value) => {
      this.columns[index].decimals = parseInt(value, 10);
      this.form.patchValue({ columns: this.columns }, { emitEvent: true });
    });
  }

  handleColumnVisibilityChange(index: number, event: Event) {
    this.onCheckboxChange(event, (checked) => {
      this.columns[index].visible = checked;
      this.form.patchValue({ columns: this.columns }, { emitEvent: true });
    });
  }

  onSave() {
    if (this.form.valid) {
      const config = new DataTableCardCardConfig();
      Object.assign(config, this.form.value);
      this.save.emit(config);
    }
  }
} 
