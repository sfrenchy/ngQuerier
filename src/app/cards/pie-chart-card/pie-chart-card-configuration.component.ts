import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TileComponent } from '@shared/components/tile/tile.component';
import { DatasourceConfigurationComponent } from '@shared/components/datasource-configuration/datasource-configuration.component';
import { PieChartCardConfig } from './pie-chart-card.models';
import { CardDto } from '@models/api.models';

@Component({
  selector: 'app-pie-chart-card-configuration',
  template: `
    <form [formGroup]="form" class="space-y-6">
      <!-- Data Source Configuration -->
      <app-tile [title]="'DATASOURCE.TITLE' | translate">
        <app-datasource-configuration
          [config]="form.getRawValue().datasource"
          (configChange)="onDatasourceChange($event)"
          (schemaChange)="onSchemaChange($event)">
        </app-datasource-configuration>
      </app-tile>

      <!-- Chart Configuration -->
      <app-tile [title]="'PieChart.CONFIGURATION' | translate" *ngIf="availableColumns.length > 0">
        <div class="space-y-4">
          <!-- Label Column -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">{{ 'PieChart.LABEL_COLUMN' | translate }}</label>
            <select formControlName="labelColumn"
                    class="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">{{ 'PieChart.SELECT_COLUMN' | translate }}</option>
              <option *ngFor="let column of availableColumns" [value]="column">{{ column }}</option>
            </select>
          </div>

          <!-- Value Column -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">{{ 'PieChart.VALUE_COLUMN' | translate }}</label>
            <select formControlName="valueColumn"
                    class="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">{{ 'PieChart.SELECT_COLUMN' | translate }}</option>
              <option *ngFor="let column of numericColumns" [value]="column">{{ column }}</option>
            </select>
          </div>

          <!-- Chart Title -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">{{ 'PieChart.TITLE' | translate }}</label>
            <input type="text" formControlName="title"
                   class="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>

          <!-- Chart Radius -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">{{ 'PieChart.RADIUS' | translate }}</label>
            <input type="text" formControlName="radius"
                   class="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   placeholder="50%">
          </div>
        </div>
      </app-tile>

      <!-- Visual Configuration -->
      <app-tile [title]="'PieChart.VISUAL_CONFIG' | translate">
        <div class="space-y-4">
          <!-- Background Color -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">{{ 'PieChart.BACKGROUND_COLOR' | translate }}</label>
            <div class="flex items-center gap-2">
              <input type="color" [formControlName]="'visualConfig.backgroundColor'"
                     class="h-10 w-10 rounded border border-gray-600">
              <input type="text" [formControlName]="'visualConfig.backgroundColor'"
                     class="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
          </div>

          <!-- Text Color -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">{{ 'PieChart.TEXT_COLOR' | translate }}</label>
            <div class="flex items-center gap-2">
              <input type="color" [formControlName]="'visualConfig.textColor'"
                     class="h-10 w-10 rounded border border-gray-600">
              <input type="text" [formControlName]="'visualConfig.textColor'"
                     class="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
          </div>

          <!-- Legend -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox"
                       [formControlName]="'visualConfig.legend.show'"
                       class="sr-only peer">
                <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span class="ml-3 text-sm font-medium text-gray-300">{{ 'PieChart.SHOW_LEGEND' | translate }}</span>
              </label>
            </div>
          </div>

          <!-- Tooltip -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox"
                       [formControlName]="'visualConfig.tooltip.show'"
                       class="sr-only peer">
                <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span class="ml-3 text-sm font-medium text-gray-300">{{ 'PieChart.SHOW_TOOLTIP' | translate }}</span>
              </label>
            </div>
          </div>
        </div>
      </app-tile>
    </form>
  `,
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
  @Output() save = new EventEmitter<PieChartCardConfig>();
  @Output() configChange = new EventEmitter<PieChartCardConfig>();

  form: FormGroup;
  availableColumns: string[] = [];
  numericColumns: string[] = [];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      datasource: [null],
      labelColumn: [''],
      valueColumn: [''],
      title: [''],
      radius: ['50%'],
      visualConfig: this.fb.group({
        backgroundColor: ['#1f2937'],
        textColor: ['#ffffff'],
        legend: this.fb.group({
          show: [true]
        }),
        tooltip: this.fb.group({
          show: [true]
        })
      })
    });

    this.form.valueChanges.subscribe((value: any) => {
      if (this.form.valid) {
        this.emitConfig(value);
      }
    });
  }

  ngOnInit() {
    if (this.card.configuration) {
      this.form.patchValue(this.card.configuration);
    }
  }

  onDatasourceChange(config: any) {
    this.form.patchValue({ datasource: config }, { emitEvent: false });
    this.emitConfig(this.form.getRawValue());
  }

  onSchemaChange(schema: string) {
    try {
      const parsedSchema = JSON.parse(schema);
      if (parsedSchema.properties) {
        // Toutes les colonnes pour les labels
        this.availableColumns = Object.keys(parsedSchema.properties);
        
        // Colonnes numériques pour les valeurs
        this.numericColumns = Object.entries(parsedSchema.properties)
          .filter(([_, prop]: [string, any]) => {
            const type = prop.type?.toLowerCase() || '';
            const columnType = prop['x-entity-metadata']?.columnType?.toLowerCase() || '';
            return type === 'number' || type === 'integer' || columnType.includes('int') || columnType.includes('decimal') || columnType.includes('float');
          })
          .map(([key]) => key);
      }
    } catch (error) {
      console.error('Error parsing schema:', error);
    }
  }

  private emitConfig(value: any) {
    const config = new PieChartCardConfig();
    Object.assign(config, value);
    this.configChange.emit(config);
  }
} 