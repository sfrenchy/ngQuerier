import { Component, EventEmitter, Input, OnInit, OnDestroy, Output, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CardDto } from '@models/api.models';
import { TileComponent } from '@shared/components/tile/tile.component';
import { DatasourceConfigurationComponent } from '@shared/components/datasource-configuration/datasource-configuration.component';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { StackedBarAndLinesChartCardConfig, BarSeriesConfig, LineSeriesConfig } from './stacked-bar-and-lines-chart.models';
import { DatasourceConfig } from '@models/datasource.models';
import { ValidationError } from '@cards/validation/validation.models';
import { LocalDataSourceService } from '@cards/data-table-card/local-datasource.service';

@Component({
  selector: 'app-stacked-bar-and-lines-chart-configuration',
  templateUrl: './stacked-bar-and-lines-chart-configuration.component.html',
  styleUrls: ['./stacked-bar-and-lines-chart-configuration.component.css'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    TileComponent,
    DatasourceConfigurationComponent
  ]
})
export class StackedBarAndLinesChartConfigurationComponent implements OnInit, OnDestroy {
  @Input() card!: CardDto<StackedBarAndLinesChartCardConfig>;
  @Output() configChange = new EventEmitter<StackedBarAndLinesChartCardConfig>();
  @Input() set validationErrors(errors: ValidationError[]) {
    this._validationErrors = errors;
    this.updateErrorMessages();
  }
  get validationErrors(): ValidationError[] {
    return this._validationErrors;
  }

  form: FormGroup;
  availableColumns: string[] = [];
  expandedBarSeriesIndex: number | null = null;
  expandedLineSeriesIndex: number | null = null;
  private destroy$ = new Subject<void>();
  private _validationErrors: ValidationError[] = [];
  errorMessages: { [key: string]: string } = {};

  constructor(
    private fb: FormBuilder,
    private localDataSourceService: LocalDataSourceService
  ) {
    this.form = this.fb.group({
      xAxisColumn: [''],
      xAxisDateFormat: [''],
      barSeries: this.fb.array([]),
      lineSeries: this.fb.array([]),
      datasource: this.fb.group({
        type: [''],
        localDataTable: this.fb.group({
          cardId: ['']
        })
      })
    });

    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (this.form.valid) {
          this.emitConfig(value);
        }
      });
  }

  get barSeriesArray() {
    return this.form.get('barSeries') as FormArray;
  }

  get lineSeriesArray() {
    return this.form.get('lineSeries') as FormArray;
  }

  createBarSeriesFormGroup(series?: BarSeriesConfig) {
    return this.fb.group({
      name: [series?.name || ''],
      dataColumn: [series?.dataColumn || ''],
      stack: [series?.stack || 'stack1'],
      color: [series?.color || '#3b82f6'],
      barWidth: [series?.barWidth || 30],
      barGap: [series?.barGap || '30%'],
      barCategoryGap: [series?.barCategoryGap || '20%']
    });
  }

  createLineSeriesFormGroup(series?: LineSeriesConfig) {
    return this.fb.group({
      name: [series?.name || ''],
      dataColumn: [series?.dataColumn || ''],
      type: [series?.type || 'line'],
      color: [series?.color || '#ef4444'],
      showSymbol: [series?.showSymbol ?? true],
      symbolSize: [series?.symbolSize || 4],
      areaStyle: this.fb.group({
        opacity: [series?.areaStyle?.opacity || 0]
      })
    });
  }

  ngOnInit() {
    if (this.card.configuration) {
      // D'abord mettre à jour la source de données
      if (this.card.configuration.datasource) {
        this.form.get('datasource')?.patchValue(this.card.configuration.datasource, { emitEvent: false });
      }

      // Puis le reste de la configuration
      this.form.patchValue({
        xAxisColumn: this.card.configuration.xAxisColumn,
        xAxisDateFormat: this.card.configuration.xAxisDateFormat
      }, { emitEvent: false });

      // Initialiser les séries de barres
      if (this.card.configuration.barSeries) {
        this.card.configuration.barSeries.forEach(series => {
          this.barSeriesArray.push(this.createBarSeriesFormGroup(series));
        });
      }

      // Initialiser les séries de lignes
      if (this.card.configuration.lineSeries) {
        this.card.configuration.lineSeries.forEach(series => {
          this.lineSeriesArray.push(this.createLineSeriesFormGroup(series));
        });
      }

      // Initialiser les colonnes si c'est une source locale
      if (this.card.configuration.datasource?.type === 'LocalDataTable') {
        const cardId = this.card.configuration.datasource.localDataTable?.cardId;
        if (cardId) {
          const schema = this.localDataSourceService.getTableSchema(cardId);
          if (schema) {
            this.availableColumns = Object.entries(schema.properties)
              .filter(([_, prop]: [string, any]) =>
                prop.type === 'number' ||
                prop.type === 'integer' ||
                prop.type === 'date' ||
                prop.type === 'datetime')
              .map(([key]) => key);
          }
        }
      }
    }

    // Observer les changements de type de source
    this.form.get('datasource.type')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(type => {
        if (type === 'LocalDataTable') {
          this.setupLocalTableSubscription();
        }
      });
  }

  private setupLocalTableSubscription() {
    const cardIdControl = this.form.get('datasource.localDataTable.cardId');

    cardIdControl?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(cardId => {
        this.localDataSourceService.getTableReadyState$(cardId)
          .pipe(take(1))
          .subscribe(state => {
            if (state.isSchemaReady) {
              const schema = this.localDataSourceService.getTableSchema(cardId);
              if (schema) {
                this.availableColumns = Object.entries(schema.properties)
                  .filter(([_, prop]: [string, any]) =>
                    prop.type === 'number' ||
                    prop.type === 'integer' ||
                    prop.type === 'date' ||
                    prop.type === 'datetime')
                  .map(([key]) => key);
              }
            }
          });
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDatasourceChange(config: DatasourceConfig) {
    // Mettre à jour le formulaire avec la nouvelle configuration
    this.form.get('datasource')?.patchValue(config);

    // Émettre la configuration
    this.emitConfig({ ...this.form.value, datasource: config });

    // Si c'est une table locale, initialiser les colonnes
    if (config.type === 'LocalDataTable' && config.localDataTable?.cardId) {
      const schema = this.localDataSourceService.getTableSchema(config.localDataTable.cardId);
      if (schema) {
        this.availableColumns = Object.entries(schema.properties)
          .filter(([_, prop]: [string, any]) =>
            prop.type === 'number' ||
            prop.type === 'integer' ||
            prop.type === 'date' ||
            prop.type === 'datetime')
          .map(([key]) => key);
      }
    }
  }

  onSchemaChange(schema: string) {
    if (schema) {
      try {
        const schemaObj = JSON.parse(schema);
        this.availableColumns = Object.keys(schemaObj.properties || {});
      } catch (e) {
        console.error('Error parsing JSON schema:', e);
        this.availableColumns = [];
      }
    } else {
      this.availableColumns = [];
    }
  }

  // Gestion des séries de barres
  addBarSeries() {
    const newSeries = this.createBarSeriesFormGroup({
      name: `Bar Series ${this.barSeriesArray.length + 1}`,
      dataColumn: '',
      stack: 'stack1',
      color: '#3b82f6',
      barWidth: 30,
      barGap: '30%',
      barCategoryGap: '20%'
    });
    this.barSeriesArray.push(newSeries);
    this.expandedBarSeriesIndex = this.barSeriesArray.length - 1;
  }

  removeBarSeries(index: number) {
    this.barSeriesArray.removeAt(index);
    if (this.expandedBarSeriesIndex === index) {
      this.expandedBarSeriesIndex = null;
    }
  }

  toggleBarSeriesExpand(index: number) {
    this.expandedBarSeriesIndex = this.expandedBarSeriesIndex === index ? null : index;
  }

  // Gestion des séries de lignes
  addLineSeries() {
    const newSeries = this.createLineSeriesFormGroup({
      name: `Line Series ${this.lineSeriesArray.length + 1}`,
      dataColumn: '',
      type: 'line',
      color: '#ef4444',
      showSymbol: true,
      symbolSize: 4,
      areaStyle: {
        opacity: 0
      }
    });
    this.lineSeriesArray.push(newSeries);
    this.expandedLineSeriesIndex = this.lineSeriesArray.length - 1;
  }

  removeLineSeries(index: number) {
    this.lineSeriesArray.removeAt(index);
    if (this.expandedLineSeriesIndex === index) {
      this.expandedLineSeriesIndex = null;
    }
  }

  toggleLineSeriesExpand(index: number) {
    this.expandedLineSeriesIndex = this.expandedLineSeriesIndex === index ? null : index;
  }

  handleAreaStyleOpacityChange(index: number, event: Event) {
    const target = event.target as HTMLInputElement;
    const opacity = parseFloat(target.value);
    if (!isNaN(opacity)) {
      const lineSeries = this.lineSeriesArray.at(index);
      lineSeries.patchValue({
        areaStyle: { opacity }
      });
    }
  }

  private emitConfig(formValue: any) {
    const config = new StackedBarAndLinesChartCardConfig();

    // Conserver la configuration de la source de données
    if (formValue.datasource) {
      config.datasource = formValue.datasource;
    } else if (this.card.configuration?.datasource) {
      config.datasource = this.card.configuration.datasource;
    }

    // Conserver la configuration visuelle
    if (this.card.configuration?.visualConfig) {
      config.visualConfig = this.card.configuration.visualConfig;
    }

    // Mettre à jour les autres propriétés
    config.xAxisColumn = formValue.xAxisColumn;
    config.xAxisDateFormat = formValue.xAxisDateFormat;
    config.barSeries = formValue.barSeries;
    config.lineSeries = formValue.lineSeries;

    this.configChange.emit(config);
  }

  private updateErrorMessages() {
    this.errorMessages = {};
    this._validationErrors.forEach(error => {
      if (error.controlPath) {
        this.errorMessages[error.controlPath] = error.message;
      }
    });
  }
}
