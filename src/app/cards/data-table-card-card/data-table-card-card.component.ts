import { Component, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Card } from '@cards/card.decorator';
import { DataTableCardCardConfigurationComponent } from './data-table-card-card-configuration.component';
import { BaseCardConfig } from '@models/api.models';
import { BaseCardComponent } from '@cards/base-card.component';
import { DatasourceConfig } from '@shared/components/datasource-configuration/datasource-configuration.component';

export class DataTableCardCardConfig extends BaseCardConfig {
  datasource?: DatasourceConfig;

  constructor() {
    super();
  }

  toJson(): any {
    return {
      datasource: this.datasource
    };
  }

  static fromJson(json: any): DataTableCardCardConfig {
    const config = new DataTableCardCardConfig();
    Object.assign(config, json);
    return config;
  }
}

@Card({
  name: 'DataTableCard',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
    <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
  </svg>`,
  configComponent: DataTableCardCardConfigurationComponent as Type<any>,
  configType: DataTableCardCardConfig,
  defaultConfig: () => new DataTableCardCardConfig()
})
@Component({
  selector: 'app-data-table-card-card',
  templateUrl: './data-table-card-card.component.html',
  standalone: true,
  imports: [CommonModule, TranslateModule]
})
export class DataTableCardCardComponent extends BaseCardComponent<DataTableCardCardConfig> {} 
