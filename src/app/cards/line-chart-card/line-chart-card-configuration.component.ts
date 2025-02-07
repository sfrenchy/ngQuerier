import { Component, EventEmitter, Input, OnInit, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CardDto } from '@models/api.models';
import { TileComponent } from '@shared/components/tile/tile.component';
import { DatasourceConfigurationComponent } from '@shared/components/datasource-configuration/datasource-configuration.component';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { LineChartCardConfig, SeriesConfig } from './line-chart-card.models';
import { DatasourceConfig } from '@models/datasource.models';
import { ValidationError } from '@cards/validation/validation.models';
import { LocalDataSourceService } from '@cards/data-table-card/local-datasource.service';

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
  @Input() set validationErrors(errors: ValidationError[]) {
    this._validationErrors = errors;
    this.updateErrorMessages();
  }
  get validationErrors(): ValidationError[] {
    return this._validationErrors;
  }
  @Output() save = new EventEmitter<LineChartCardConfig>();
  @Output() configChange = new EventEmitter<LineChartCardConfig>();

  private _validationErrors: ValidationError[] = [];
  errorMessages: { [key: string]: string } = {};

  form: FormGroup;
  jsonSchema: string | null = null;
  availableColumns: string[] = [];
  numericColumns: string[] = [];
  expandedSeriesIndex: number | null = null;
  private destroy$ = new Subject<void>();

  // Form controls
  xAxisColumnControl = new FormControl('');
  xAxisDateFormatControl = new FormControl('');

  constructor(private fb: FormBuilder, private localDataSourceService: LocalDataSourceService) {
    this.form = this.fb.group({
      datasource: [{ type: 'API' } as DatasourceConfig],
      xAxisColumn: this.xAxisColumnControl,
      xAxisDateFormat: this.xAxisDateFormatControl,
      series: [[]],
      visualConfig: [null]
    });

    this.form.valueChanges.subscribe((value: any) => {
      if (this.form.valid) {
        const { visualConfig, ...rest } = value;
        this.emitConfig({ ...rest, visualConfig: this.card.configuration?.visualConfig });
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
    if (formValue.xAxisDateFormat) {
      config.xAxisDateFormat = formValue.xAxisDateFormat;
    }
    if (formValue.series) {
      config.series = formValue.series;
    }
    if (this.card.configuration?.visualConfig) {
      config.visualConfig = this.card.configuration.visualConfig;
    }
    this.configChange.emit(config);
  }

  ngOnInit() {
    if (this.card.configuration) {
      this.form.patchValue({
        datasource: this.card.configuration.datasource,
        xAxisColumn: this.card.configuration.xAxisColumn,
        xAxisDateFormat: this.card.configuration.xAxisDateFormat,
        series: this.card.configuration.series,
        visualConfig: this.card.configuration.visualConfig
      }, { emitEvent: false });

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
    // Observer les changements de table sélectionnée
    const cardIdControl = this.form.get('datasource.localDataTable.cardId');
    console.log('Form value:', this.form.value);
    console.log('CardId control:', cardIdControl?.value);

    cardIdControl?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(cardId => {
        console.log('Table sélectionnée:', cardId);

        // Attendre que le schéma soit disponible
        this.localDataSourceService.getTableReadyState$(cardId)
          .pipe(take(1))
          .subscribe(state => {
            console.log('État de la table:', state);
            if (state.isSchemaReady) {
              const schema = this.localDataSourceService.getTableSchema(cardId);
              console.log('Schéma récupéré:', schema);

              if (schema) {
                // Filtrer pour ne garder que les colonnes numériques et dates
                this.availableColumns = Object.entries(schema.properties)
                  .filter(([key, prop]: [string, any]) => {
                    const isValid = prop.type === 'number' ||
                      prop.type === 'integer' ||
                      prop.type === 'date' ||
                      prop.type === 'datetime';
                    console.log(`Colonne ${key}: type=${prop.type}, valide=${isValid}`);
                    return isValid;
                  })
                  .map(([key]) => key);
                console.log('Colonnes disponibles:', this.availableColumns);
              } else {
                console.log('Pas de schéma disponible');
              }
            } else {
              console.log('Schéma pas encore prêt');
            }
          });
      });
  }

  onDatasourceChange(config: DatasourceConfig) {
    console.log('[LineChartConfig] Nouvelle config datasource:', config);
    this.form.patchValue({ datasource: config });

    // Si c'est une table locale, initialiser les colonnes
    if (config.type === 'LocalDataTable' && config.localDataTable?.cardId) {
      const schema = this.localDataSourceService.getTableSchema(config.localDataTable.cardId);
      console.log('Schema from onDatasourceChange:', schema);

      if (schema) {
        this.availableColumns = Object.entries(schema.properties)
          .filter(([_, prop]: [string, any]) => {
            const isValid = prop.type === 'number' ||
              prop.type === 'integer' ||
              prop.type === 'date' ||
              prop.type === 'datetime';
            console.log(`Column ${_}: type=${prop.type}, valid=${isValid}`);
            return isValid;
          })
          .map(([key]) => key);
        console.log('Available columns:', this.availableColumns);
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

  addSeries() {
    const series = this.form.get('series')?.value || [];
    series.push({
      name: `Series ${series.length + 1}`,
      dataColumn: '',
      type: 'line',
      color: '#3b82f6',
      showSymbol: true,
      symbolSize: 4,
      areaStyle: {
        opacity: 0
      }
    });
    this.form.patchValue({ series }, { emitEvent: true });
    this.expandedSeriesIndex = series.length - 1;
  }

  removeSeries(index: number) {
    const series = this.form.get('series')?.value || [];
    series.splice(index, 1);
    this.form.patchValue({ series }, { emitEvent: true });
    if (this.expandedSeriesIndex === index) {
      this.expandedSeriesIndex = null;
    }
  }

  toggleSeriesExpand(index: number) {
    this.expandedSeriesIndex = this.expandedSeriesIndex === index ? null : index;
  }

  handleSeriesChange(index: number, property: keyof SeriesConfig, event: Event) {
    const series = this.form.get('series')?.value || [];
    let value: any;

    if (event instanceof Event) {
      const target = event.target as HTMLInputElement;
      value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    } else {
      value = event;
    }

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

  onSave() {
    if (this.form.valid) {
      this.save.emit(this.form.value);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateErrorMessages() {
    this.errorMessages = {};
    this._validationErrors.forEach(error => {
      if (error.controlPath) {
        this.errorMessages[error.controlPath] = error.message;
      }
    });
  }

  hasError(controlPath: string): boolean {
    return !!this.errorMessages[controlPath];
  }

  hasSeriesErrors(index: number): boolean {
    return Object.keys(this.errorMessages).some(key => key.startsWith(`series.${index}`));
  }

  getSeriesErrorKey(index: number, field: string): string {
    return `series.${index}.${field}`;
  }

  hasSeriesError(index: number, field: string): boolean {
    return !!this.errorMessages[this.getSeriesErrorKey(index, field)];
  }
}
