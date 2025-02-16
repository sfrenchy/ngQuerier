import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {TileComponent} from '@shared/components/tile/tile.component';
import {
  DatasourceConfigurationComponent
} from '@shared/components/datasource-configuration/datasource-configuration.component';
import {PieChartCardConfig} from './pie-chart-card.models';
import {CardDto} from '@models/api.models';
import {DatasourceConfig} from '@models/datasource.models';
import {ValidationError} from '@cards/validation/validation.models';
import {LocalDataSourceService} from '@cards/data-table-card/local-datasource.service';
import {take, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-pie-chart-card-configuration',
  templateUrl: './pie-chart-card-configuration.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    TileComponent,
    DatasourceConfigurationComponent
  ]
})
export class PieChartCardConfigurationComponent implements OnInit {
  @Input() card!: CardDto<PieChartCardConfig>;
  @Output() configChange = new EventEmitter<PieChartCardConfig>();

  @Input() set validationErrors(errors: ValidationError[]) {
    this._validationErrors = errors;
    this.updateErrorMessages();
  }

  get validationErrors(): ValidationError[] {
    return this._validationErrors;
  }

  private _validationErrors: ValidationError[] = [];
  errorMessages: { [key: string]: string } = {};
  form: FormGroup;
  availableColumns: string[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private localDataSourceService: LocalDataSourceService
  ) {
    this.form = this.fb.group({
      labelColumn: [''],
      valueColumn: [''],
      radius: ['75%'],
      datasource: this.fb.group({
        type: [''],
        localDataTable: this.fb.group({
          cardId: ['']
        }),
        query: [null]
      })
    });

    this.form.valueChanges.subscribe(value => {
      if (this.form.valid) {
        this.emitConfig(value);
      }
    });
  }

  ngOnInit() {
    if (this.card.configuration) {
      if (this.card.configuration.datasource) {
        this.form.get('datasource')?.patchValue(this.card.configuration.datasource, {emitEvent: false});
      }

      this.form.patchValue({
        labelColumn: this.card.configuration.labelColumn,
        valueColumn: this.card.configuration.valueColumn,
        radius: this.card.configuration.radius
      }, {emitEvent: false});

      if (this.card.configuration.datasource?.type === 'LocalDataTable') {
        const cardId = this.card.configuration.datasource.localDataTable?.cardId;
        if (cardId) {
          const schema = this.localDataSourceService.getTableSchema(cardId);
          if (schema) {
            this.availableColumns = Object.keys(schema.properties || {});
          }
        }
      }
    }

    this.form.get('datasource.type')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(type => {
        if (type === 'LocalDataTable') {
          this.setupLocalTableSubscription();
        }
      });
  }

  onDatasourceChange(config: DatasourceConfig) {

    this.form.get('datasource')?.patchValue(config, { emitEvent: false });

    if (config.type === 'SQLQuery' && config.query) {
      this.form.get('datasource.query')?.patchValue(config.query);
    }

    // Si c'est une table locale, initialiser les colonnes
    if (config.type === 'LocalDataTable' && config.localDataTable?.cardId) {
      const schema = this.localDataSourceService.getTableSchema(config.localDataTable.cardId);

      if (schema) {
        this.availableColumns = Object.entries(schema.properties)
          .filter(([_, prop]: [string, any]) => {
            const isValid = prop.type === 'number' ||
              prop.type === 'integer' ||
              prop.type === 'date' ||
              prop.type === 'datetime';
            return true; // TODO: Check if the column is valid
          })
          .map(([key]) => key);
      }
    }

    const formValue = this.form.value;

    this.emitConfig(formValue);
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
                this.availableColumns = Object.keys(schema.properties || {});
              }
            }
          });
      });
  }

  private emitConfig(formValue: {
    datasource?: DatasourceConfig;
    labelColumn?: string;
    valueColumn?: string;
    radius?: string;
  }) {

    const config = new PieChartCardConfig();
    if (formValue.datasource) {
      const datasource = JSON.parse(JSON.stringify(formValue.datasource));
      config.datasource = datasource;
    }
    if (formValue.labelColumn) {
      config.labelColumn = formValue.labelColumn;
    }
    if (formValue.valueColumn) {
      config.valueColumn = formValue.valueColumn;
    }
    if (formValue.radius) {
      config.radius = formValue.radius;
    }
    if (this.card.configuration?.visualConfig) {
      config.visualConfig = this.card.configuration.visualConfig;
    }

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
}
