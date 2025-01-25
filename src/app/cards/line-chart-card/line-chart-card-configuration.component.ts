import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CardDto } from '@models/api.models';
import { TileComponent } from '@shared/components/tile/tile.component';
import { DatasourceConfigurationComponent } from '@shared/components/datasource-configuration/datasource-configuration.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LineChartCardConfig, SeriesConfig } from './line-chart-card.models';
import { DatasourceConfig } from '@models/datasource.models';

@Component({
  selector: 'app-line-chart-card-configuration',
  templateUrl: './line-chart-card-configuration.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    TileComponent,
    DatasourceConfigurationComponent
  ]
})
export class LineChartCardConfigurationComponent implements OnInit, OnDestroy {
  @Input() card!: CardDto<LineChartCardConfig>;
  @Output() save = new EventEmitter<LineChartCardConfig>();
  @Output() configChange = new EventEmitter<LineChartCardConfig>();

  form: FormGroup;
  jsonSchema: string | null = null;
  availableColumns: string[] = [];
  numericColumns: string[] = [];
  expandedSeriesIndex: number | null = null;
  private destroy$ = new Subject<void>();

  get xAxisColumnControl() {
    return this.form.get('xAxisColumn') as FormControl;
  }

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      datasource: [null],
      xAxisColumn: [''],
      series: [[]],
      visualConfig: [null]
    });

    this.form.valueChanges.subscribe((value: any) => {
      if (this.form.valid) {
        this.emitConfig(value);
      }
    });
  }

  private emitConfig(formValue: any) {
    const config = new LineChartCardConfig();
    if (formValue.datasource) {
      config.datasource = formValue.datasource;
    }
    if (formValue.xAxisColumn) {
      config.xAxisColumn = formValue.xAxisColumn;
    }
    if (formValue.series) {
      config.series = formValue.series;
    }
    if (formValue.visualConfig) {
      config.visualConfig = {
        ...config.visualConfig,
        ...formValue.visualConfig
      };
    }
    this.configChange.emit(config);
  }

  ngOnInit() {
    if (this.card.configuration) {
      this.form.patchValue({
        datasource: this.card.configuration.datasource,
        xAxisColumn: this.card.configuration.xAxisColumn,
        series: this.card.configuration.series,
        visualConfig: this.card.configuration.visualConfig
      }, { emitEvent: false });
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
        this.updateAvailableColumns(schemaObj);
      } catch (e) {
        console.error('Error parsing JSON schema:', e);
      }
    }
  }

  private updateAvailableColumns(schema: any) {
    if (schema.properties) {
      // Toutes les colonnes pour l'axe X
      this.availableColumns = Object.keys(schema.properties);
      
      // Colonnes numériques pour les séries
      this.numericColumns = Object.entries(schema.properties)
        .filter(([_, prop]: [string, any]) => {
          const type = prop.type?.toLowerCase() || '';
          const columnType = prop['x-entity-metadata']?.columnType?.toLowerCase() || '';
          return type === 'number' || type === 'integer' || columnType.includes('int') || columnType.includes('decimal') || columnType.includes('float');
        })
        .map(([key]) => key);
    }
  }

  addSeries() {
    const series = this.form.get('series')?.value || [];
    series.push({
      name: `Series ${series.length + 1}`,
      dataColumn: '',
      type: 'line',
      showSymbol: true,
      symbolSize: 4
    });
    this.form.patchValue({ series }, { emitEvent: true });
  }

  removeSeries(index: number) {
    const series = this.form.get('series')?.value || [];
    series.splice(index, 1);
    this.form.patchValue({ series }, { emitEvent: true });
  }

  toggleSeriesExpand(index: number) {
    this.expandedSeriesIndex = this.expandedSeriesIndex === index ? null : index;
  }

  handleSeriesChange(index: number, property: keyof SeriesConfig, event: Event) {
    const series = this.form.get('series')?.value || [];
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    
    series[index] = {
      ...series[index],
      [property]: value
    };

    this.form.patchValue({ series }, { emitEvent: true });
  }

  onAreaOpacityChange(index: number, event: Event) {
    const target = event.target as HTMLInputElement;
    const opacity = parseFloat(target.value);
    const series = this.form.get('series')?.value || [];
    
    series[index] = {
      ...series[index],
      areaStyle: {
        ...series[index].areaStyle,
        opacity
      }
    };

    this.form.patchValue({ series }, { emitEvent: true });
  }

  handleVisualConfigChange(path: string, event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    
    const visualConfig = {
      ...this.form.get('visualConfig')?.value
    };

    // Gestion des chemins imbriqués (ex: 'grid.top')
    const parts = path.split('.');
    let current: any = visualConfig;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;

    this.form.patchValue({ visualConfig }, { emitEvent: true });
  }

  onSave() {
    if (this.form.valid) {
      this.save.emit(this.form.value);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
} 