import { Component, EventEmitter, Input, OnInit, Output, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CardDto } from '@models/api.models';
import { TileComponent } from '@shared/components/tile/tile.component';
import { DatasourceConfigurationComponent } from '@shared/components/datasource-configuration/datasource-configuration.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StackedBarAndLinesChartCardConfig, BarSeriesConfig, LineSeriesConfig } from './stacked-bar-and-lines-chart.models';
import { DatasourceConfig } from '@models/datasource.models';

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

  form: FormGroup;
  availableColumns: string[] = [];
  expandedBarSeriesIndex: number | null = null;
  expandedLineSeriesIndex: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      xAxisColumn: [''],
      xAxisDateFormat: [''],
      barSeries: [[]],
      lineSeries: [[]]
    });

    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (this.form.valid) {
          this.emitConfig(value);
        }
      });
  }

  ngOnInit() {
    if (this.card.configuration) {
      this.form.patchValue({
        xAxisColumn: this.card.configuration.xAxisColumn,
        xAxisDateFormat: this.card.configuration.xAxisDateFormat,
        barSeries: this.card.configuration.barSeries,
        lineSeries: this.card.configuration.lineSeries
      }, { emitEvent: false });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDatasourceChange(config: DatasourceConfig) {
    this.emitConfig({ ...this.form.value, datasource: config });
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
    const barSeries = this.form.get('barSeries')?.value || [];
    barSeries.push({
      name: `Bar Series ${barSeries.length + 1}`,
      dataColumn: '',
      stack: 'stack1',
      color: '#3b82f6',
      barWidth: 30,
      barGap: '30%',
      barCategoryGap: '20%'
    });
    this.form.patchValue({ barSeries }, { emitEvent: true });
    this.expandedBarSeriesIndex = barSeries.length - 1;
  }

  removeBarSeries(index: number) {
    const barSeries = this.form.get('barSeries')?.value || [];
    barSeries.splice(index, 1);
    this.form.patchValue({ barSeries }, { emitEvent: true });
    if (this.expandedBarSeriesIndex === index) {
      this.expandedBarSeriesIndex = null;
    }
  }

  toggleBarSeriesExpand(index: number) {
    this.expandedBarSeriesIndex = this.expandedBarSeriesIndex === index ? null : index;
  }

  // Gestion des séries de lignes
  addLineSeries() {
    const lineSeries = this.form.get('lineSeries')?.value || [];
    lineSeries.push({
      name: `Line Series ${lineSeries.length + 1}`,
      dataColumn: '',
      type: 'line',
      color: '#ef4444',
      showSymbol: true,
      symbolSize: 4,
      areaStyle: {
        opacity: 0
      }
    });
    this.form.patchValue({ lineSeries }, { emitEvent: true });
    this.expandedLineSeriesIndex = lineSeries.length - 1;
  }

  removeLineSeries(index: number) {
    const lineSeries = this.form.get('lineSeries')?.value || [];
    lineSeries.splice(index, 1);
    this.form.patchValue({ lineSeries }, { emitEvent: true });
    if (this.expandedLineSeriesIndex === index) {
      this.expandedLineSeriesIndex = null;
    }
  }

  toggleLineSeriesExpand(index: number) {
    this.expandedLineSeriesIndex = this.expandedLineSeriesIndex === index ? null : index;
  }

  // Gestion des changements de séries
  handleBarSeriesChange(index: number, property: keyof BarSeriesConfig, event: Event) {
    const barSeries = this.form.get('barSeries')?.value || [];
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    
    barSeries[index] = {
      ...barSeries[index],
      [property]: value
    };

    this.form.patchValue({ barSeries }, { emitEvent: true });
  }

  handleLineSeriesChange(index: number, property: keyof LineSeriesConfig, event: Event | { opacity: number }) {
    const lineSeries = this.form.get('lineSeries')?.value || [];
    let value: any;
    
    if (property === 'areaStyle') {
      value = { opacity: (event as { opacity: number }).opacity };
    } else if (event instanceof Event) {
      const target = event.target as HTMLInputElement | HTMLSelectElement;
      value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    }
    
    lineSeries[index] = {
      ...lineSeries[index],
      [property]: value
    };

    this.form.patchValue({ lineSeries }, { emitEvent: true });
  }

  handleAreaStyleOpacityChange(index: number, event: Event) {
    const target = event.target as HTMLInputElement;
    const opacity = parseFloat(target.value);
    if (!isNaN(opacity)) {
      this.handleLineSeriesChange(index, 'areaStyle', { opacity });
    }
  }

  private emitConfig(formValue: any) {
    const config = new StackedBarAndLinesChartCardConfig();
    if (this.card.configuration?.datasource) {
      config.datasource = this.card.configuration.datasource;
    }
    if (this.card.configuration?.visualConfig) {
      config.visualConfig = this.card.configuration.visualConfig;
    }
    config.xAxisColumn = formValue.xAxisColumn;
    config.xAxisDateFormat = formValue.xAxisDateFormat;
    config.barSeries = formValue.barSeries;
    config.lineSeries = formValue.lineSeries;

    this.configChange.emit(config);
  }
} 