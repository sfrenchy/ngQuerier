import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DataTableCardCardConfig } from './data-table-card-card.component';
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

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      datasource: [null]
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
        datasource: this.card.configuration.datasource
      }, { emitEvent: false });
    }
  }

  onDatasourceChange(datasource: DatasourceConfig) {
    this.form.patchValue({ datasource }, { emitEvent: true });
  }

  onSchemaChange(schema: string) {
    this.jsonSchema = schema;
    console.log(JSON.parse(this.jsonSchema));
    // TODO: Utiliser ce schéma pour configurer les colonnes de la table
  }

  onSave() {
    if (this.form.valid) {
      const config = new DataTableCardCardConfig();
      Object.assign(config, this.form.value);
      this.save.emit(config);
    }
  }
} 
