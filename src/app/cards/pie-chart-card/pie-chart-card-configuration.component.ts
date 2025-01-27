import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TileComponent } from '@shared/components/tile/tile.component';
import { DatasourceConfigurationComponent } from '@shared/components/datasource-configuration/datasource-configuration.component';
import { PieChartCardConfig } from './pie-chart-card.models';
import { CardDto } from '@models/api.models';
import { DatasourceConfig } from '@models/datasource.models';

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

  form: FormGroup;
  availableColumns: string[] = [];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      labelColumn: [''],
      valueColumn: [''],
      radius: ['75%']
    });

    this.form.valueChanges.subscribe(value => {
      if (this.form.valid) {
        this.emitConfig(value);
      }
    });
  }

  ngOnInit() {
    if (this.card.configuration) {
      this.form.patchValue({
        labelColumn: this.card.configuration.labelColumn,
        valueColumn: this.card.configuration.valueColumn,
        radius: this.card.configuration.radius
      }, { emitEvent: false });
    }
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

  private emitConfig(formValue: any) {
    const config = new PieChartCardConfig();
    if (this.card.configuration?.datasource) {
      config.datasource = this.card.configuration.datasource;
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
} 