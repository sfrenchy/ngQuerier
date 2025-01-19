import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DataTableCardConfig, ColumnConfig, TableVisualConfig, CrudConfig, ForeignKeyDisplayConfig } from './data-table-card.models';
import { CardDto } from '@models/api.models';
import { TileComponent } from '@shared/components/tile/tile.component';
import { DatasourceConfig } from '@models/datasource.models';
import { DatasourceConfigurationComponent } from '@shared/components/datasource-configuration/datasource-configuration.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataTableCardService } from './data-table-card.service';
import { CardDatabaseService } from '@services/card-database.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-data-table-card-configuration',
  templateUrl: './data-table-card-configuration.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    TileComponent,
    DatasourceConfigurationComponent
  ]
})
export class DataTableCardConfigurationComponent implements OnInit, OnDestroy {
  @Input() card!: CardDto<DataTableCardConfig>;
  @Output() save = new EventEmitter<DataTableCardConfig>();
  @Output() configChange = new EventEmitter<DataTableCardConfig>();

  form: FormGroup;
  jsonSchema: string | null = null;
  columns: ColumnConfig[] = [];
  expandedColumnIndex: number | null = null;
  draggedColumnIndex: number | null = null;
  private destroy$ = new Subject<void>();
  private expandedTables = new Set<string>();
  private tableSchemaCache = new Map<string, any>();
  private loadingTables = new Set<string>();

  constructor(
    private fb: FormBuilder,
    private dataTableService: DataTableCardService,
    private cardDatabaseService: CardDatabaseService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      datasource: [null],
      columns: [[]],
      visualConfig: [null],
      crudConfig: [null]
    });

    this.form.valueChanges.subscribe((value: any) => {
      if (this.form.valid) {
        this.emitConfig(value);
      }
    });
  }

  private emitConfig(formValue: any) {
    const config = new DataTableCardConfig();
    if (formValue.datasource) {
      config.datasource = formValue.datasource;
    }
    if (formValue.columns) {
      config.columns = formValue.columns;
    }
    if (formValue.visualConfig) {
      config.visualConfig = formValue.visualConfig;
    }
    if (formValue.crudConfig) {
      config.crudConfig = formValue.crudConfig;
    }
    this.configChange.emit(config);
  }

  ngOnInit() {
    if (this.card.configuration) {
      this.form.patchValue({
        datasource: this.card.configuration.datasource,
        columns: this.card.configuration.columns || [],
        visualConfig: this.card.configuration.visualConfig,
        crudConfig: this.card.configuration.crudConfig
      }, { emitEvent: false });
      this.columns = this.card.configuration.columns || [];
    } else {
      // Initialiser avec les valeurs par défaut si pas de configuration
      const defaultConfig = new DataTableCardConfig();
      this.form.patchValue({
        visualConfig: defaultConfig.visualConfig,
        crudConfig: defaultConfig.crudConfig
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
    return this.dataTableService.getColumnType(prop);
  }

  private getDefaultAlignment(type: string): 'left' | 'center' | 'right' {
    return this.dataTableService.getDefaultAlignment(type);
  }

  toggleColumnExpand(index: number) {
    this.expandedColumnIndex = this.expandedColumnIndex === index ? null : index;
  }

  onDragStart(event: DragEvent, index: number) {
    this.draggedColumnIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent, targetIndex: number) {
    event.preventDefault();
    
    if (this.draggedColumnIndex === null || this.draggedColumnIndex === targetIndex) {
      return;
    }

    // Réorganiser les colonnes
    const column = this.columns[this.draggedColumnIndex];
    this.columns.splice(this.draggedColumnIndex, 1);
    this.columns.splice(targetIndex, 0, column);

    // Mettre à jour le formulaire
    this.form.patchValue({ columns: this.columns }, { emitEvent: true });
    
    this.draggedColumnIndex = null;
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
      
      // Si on cache une colonne fixe, on doit mettre à jour l'état des colonnes fixes
      if (!checked && this.columns[index].isFixed) {
        this.columns[index].isFixed = false;
        
        // Vérifier si les colonnes suivantes peuvent rester fixes
        const visibleColumns = this.columns.filter(c => c.visible);
        let shouldUnfix = true;
        
        for (const column of this.columns) {
          if (column === this.columns[index]) {
            shouldUnfix = true;
            continue;
          }
          
          if (shouldUnfix && column.isFixed) {
            column.isFixed = false;
          }
        }
      }
      
      this.form.patchValue({ columns: this.columns }, { emitEvent: true });
    });
  }

  handleColumnDateFormatChange(index: number, event: Event) {
    this.onSelectChange(event, (value) => {
      this.columns[index].dateFormat = value as 'date' | 'time' | 'datetime';
      this.form.patchValue({ columns: this.columns }, { emitEvent: true });
    });
  }

  canBeFixed(index: number): boolean {
    const visibleColumns = this.columns.filter(c => c.visible);
    const currentVisibleIndex = visibleColumns.findIndex(c => c === this.columns[index]);
    
    // Si la colonne n'est pas visible, elle ne peut pas être fixée
    if (currentVisibleIndex === -1) return false;
    
    // La première colonne visible peut toujours être fixée
    if (currentVisibleIndex === 0) return true;
    
    // Pour les autres colonnes visibles, vérifier si toutes les colonnes visibles précédentes sont fixées
    for (let i = 0; i < currentVisibleIndex; i++) {
      if (!visibleColumns[i].isFixed) {
        return false;
      }
    }
    return true;
  }

  canBeFixedRight(index: number): boolean {
    const visibleColumns = this.columns.filter(c => c.visible);
    const currentVisibleIndex = visibleColumns.findIndex(c => c === this.columns[index]);
    
    // Si la colonne n'est pas visible, elle ne peut pas être fixée
    if (currentVisibleIndex === -1) return false;
    
    // La dernière colonne visible peut toujours être fixée
    if (currentVisibleIndex === visibleColumns.length - 1) return true;
    
    // Pour les autres colonnes visibles, vérifier si toutes les colonnes visibles suivantes sont fixées à droite
    for (let i = visibleColumns.length - 1; i > currentVisibleIndex; i--) {
      if (!visibleColumns[i].isFixedRight) {
        return false;
      }
    }
    return true;
  }

  handleColumnFixedChange(index: number, event: Event) {
    this.onCheckboxChange(event, (checked) => {
      // Si la colonne n'est pas visible, on ne peut pas la fixer
      if (!this.columns[index].visible) {
        return;
      }

      const visibleColumns = this.columns.filter(c => c.visible);
      const currentVisibleIndex = visibleColumns.findIndex(c => c === this.columns[index]);
      
      // Si on désactive une colonne fixe, on désactive aussi toutes les colonnes visibles suivantes
      if (!checked) {
        for (let i = currentVisibleIndex; i < visibleColumns.length; i++) {
          visibleColumns[i].isFixed = false;
        }
      } else {
        this.columns[index].isFixed = true;
        // Si on fixe une colonne à gauche, on s'assure qu'elle n'est pas fixée à droite
        this.columns[index].isFixedRight = false;
      }
      
      this.form.patchValue({ columns: this.columns }, { emitEvent: true });
    });
  }

  handleColumnFixedRightChange(index: number, event: Event) {
    this.onCheckboxChange(event, (checked) => {
      // Si la colonne n'est pas visible, on ne peut pas la fixer
      if (!this.columns[index].visible) {
        return;
      }

      const visibleColumns = this.columns.filter(c => c.visible);
      const currentVisibleIndex = visibleColumns.findIndex(c => c === this.columns[index]);
      
      // Si on désactive une colonne fixe à droite, on désactive aussi toutes les colonnes visibles précédentes
      if (!checked) {
        for (let i = currentVisibleIndex; i >= 0; i--) {
          visibleColumns[i].isFixedRight = false;
        }
      } else {
        this.columns[index].isFixedRight = true;
        // Si on fixe une colonne à droite, on s'assure qu'elle n'est pas fixée à gauche
        this.columns[index].isFixed = false;
      }
      
      this.form.patchValue({ columns: this.columns }, { emitEvent: true });
    });
  }

  onSave() {
    if (this.form.valid) {
      const config = new DataTableCardConfig();
      const formValue = this.form.value;
      if (formValue.datasource) {
        config.datasource = formValue.datasource;
      }
      if (formValue.columns) {
        config.columns = formValue.columns;
      }
      if (formValue.visualConfig) {
        config.visualConfig = formValue.visualConfig;
      }
      this.save.emit(config);
    }
  }

  handleVisualConfigChange(property: keyof TableVisualConfig, event: Event) {
    const currentVisualConfig = this.form.getRawValue().visualConfig;
    let value: string | boolean;

    if (property === 'isCompactMode') {
      value = (event.target as HTMLInputElement).checked;
    } else {
      value = (event.target as HTMLInputElement).value;
    }

    const newVisualConfig = {
      ...currentVisualConfig,
      [property]: value
    };

    this.form.patchValue({ visualConfig: newVisualConfig });
  }

  isDateColumn(column: ColumnConfig): boolean {
    return this.dataTableService.isDateColumn(column);
  }

  isNumberColumn(column: ColumnConfig): boolean {
    return this.dataTableService.isNumberColumn(column);
  }

  handleCrudConfigChange(property: keyof CrudConfig, event: Event) {
    const currentCrudConfig = this.form.getRawValue().crudConfig;
    const value = (event.target as HTMLInputElement).checked;

    const newCrudConfig = {
      ...currentCrudConfig,
      [property]: value
    };

    this.form.patchValue({ crudConfig: newCrudConfig });
  }

  canEnableCrud(): boolean {
    const datasource = this.form.getRawValue().datasource;
    return datasource?.type === 'API' || datasource?.type === 'EntityFramework';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getForeignKeyTables(): string[] {
    if (!this.columns) return [];
    
    const tables = new Set<string>();
    this.columns.forEach(column => {
      if (column.entityMetadata?.isForeignKey && column.entityMetadata?.foreignKeyTable) {
        tables.add(column.entityMetadata.foreignKeyTable);
      }
    });
    return Array.from(tables);
  }

  toggleForeignKeyConfig(table: string) {
    if (this.expandedTables.has(table)) {
      this.expandedTables.delete(table);
    } else {
      this.expandedTables.add(table);
      // Charger le schéma de la table si pas déjà fait
      this.loadTableSchema(table);
    }
  }

  isTableConfigExpanded(table: string): boolean {
    return this.expandedTables.has(table);
  }

  isTableLoading(table: string): boolean {
    return this.loadingTables.has(table);
  }

  private loadTableSchema(table: string) {
    if (this.tableSchemaCache.has(table)) {
      console.log('Using cached schema for table:', table);
      return;
    }

    const datasource = this.form.value.datasource;
    if (!datasource) {
      console.log('No datasource configured');
      return;
    }

    console.log('Loading schema for table:', table);
    this.loadingTables.add(table);
    this.cdr.detectChanges();

    this.cardDatabaseService.getDatabaseEndpoints(
      datasource.connection.id,
      null,
      table,
      'GetById'
    ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (endpoints: any[]) => {
          console.log('Received endpoints:', endpoints);
          const endpoint = endpoints[0];
          if (endpoint) {
            const successResponse = endpoint.responses.find((r: any) => r.statusCode === 200);
            if (successResponse) {
              try {
                const schema = JSON.parse(successResponse.jsonSchema);
                console.log('Parsed schema:', schema);
                this.tableSchemaCache.set(table, schema);
              } catch (e) {
                console.error('Error parsing schema:', e);
              }
            }
          }
          this.loadingTables.delete(table);
          this.cdr.detectChanges();
        },
        error: (error: Error) => {
          console.error(`Error loading schema for table ${table}:`, error);
          this.loadingTables.delete(table);
          this.cdr.detectChanges();
        }
      });
  }

  getAvailableColumns(table: string): string[] {
    const schema = this.tableSchemaCache.get(table);
    console.log('Schema for table', table, ':', schema);
    if (!schema?.properties) {
      console.log('No properties found in schema');
      return [];
    }

    const columns = Object.entries(schema.properties)
      .filter(([_, prop]: [string, any]) => {
        // Exclure les propriétés de navigation et les collections
        const metadata = prop['x-entity-metadata'];
        const isNotNavigation = !metadata?.isNavigation;
        const isNotCollection = !metadata?.isCollection;
        const isNotPrimaryKey = !metadata?.isPrimaryKey;
        const isNotForeignKey = !metadata?.isForeignKey;
        
        console.log('Property:', _, 
          'isNotNavigation:', isNotNavigation, 
          'isNotCollection:', isNotCollection,
          'isNotPrimaryKey:', isNotPrimaryKey,
          'isNotForeignKey:', isNotForeignKey);
        
        return isNotNavigation && isNotCollection && isNotPrimaryKey && isNotForeignKey;
      })
      .map(([key]) => key);
    
    console.log('Available columns:', columns);
    return columns;
  }

  getForeignKeyConfig(table: string): ForeignKeyDisplayConfig | undefined {
    const currentConfig = this.form.getRawValue().crudConfig?.foreignKeyConfigs || {};
    return currentConfig[table];
  }

  private ensureForeignKeyConfig(table: string): ForeignKeyDisplayConfig {
    const currentConfig = this.form.getRawValue().crudConfig || {};
    const foreignKeyConfigs = currentConfig.foreignKeyConfigs || {};
    
    if (!foreignKeyConfigs[table]) {
      foreignKeyConfigs[table] = {
        table,
        displayColumns: [],
        searchColumns: []
      };
      
      this.form.patchValue({
        crudConfig: {
          ...currentConfig,
          foreignKeyConfigs
        }
      });
    }
    
    return foreignKeyConfigs[table];
  }

  toggleDisplayColumn(table: string, column: string) {
    const config = this.ensureForeignKeyConfig(table);
    const index = config.displayColumns.indexOf(column);
    
    if (index === -1) {
      config.displayColumns.push(column);
    } else {
      config.displayColumns.splice(index, 1);
    }
    
    this.updateForeignKeyConfig(table, config);
  }

  toggleSearchColumn(table: string, column: string) {
    const config = this.ensureForeignKeyConfig(table);
    if (!config.searchColumns) config.searchColumns = [];
    
    const index = config.searchColumns.indexOf(column);
    
    if (index === -1) {
      config.searchColumns.push(column);
    } else {
      config.searchColumns.splice(index, 1);
    }
    
    this.updateForeignKeyConfig(table, config);
  }

  isColumnSelected(table: string, column: string): boolean {
    const config = this.getForeignKeyConfig(table);
    return config?.displayColumns?.includes(column) || false;
  }

  isSearchColumnSelected(table: string, column: string): boolean {
    const config = this.getForeignKeyConfig(table);
    return config?.searchColumns?.includes(column) || false;
  }

  updateDisplayFormat(table: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const config = this.ensureForeignKeyConfig(table);
    config.displayFormat = input.value;
    this.updateForeignKeyConfig(table, config);
  }

  private updateForeignKeyConfig(table: string, config: ForeignKeyDisplayConfig) {
    const currentConfig = this.form.getRawValue().crudConfig;
    const foreignKeyConfigs = {
      ...currentConfig.foreignKeyConfigs,
      [table]: config
    };
    
    this.form.patchValue({
      crudConfig: {
        ...currentConfig,
        foreignKeyConfigs
      }
    });
  }

  hasMinimumDisplayColumns(table: string): boolean {
    const config = this.getForeignKeyConfig(table);
    return (config?.displayColumns?.length ?? 0) > 0;
  }

  hasMinimumSearchColumns(table: string): boolean {
    const config = this.getForeignKeyConfig(table);
    return (config?.searchColumns?.length ?? 0) > 0;
  }

  canSelectMoreDisplayColumns(table: string): boolean {
    const config = this.getForeignKeyConfig(table);
    // Pas de limite sur le nombre de colonnes d'affichage
    return true;
  }

  canSelectMoreSearchColumns(table: string): boolean {
    const config = this.getForeignKeyConfig(table);
    // Pas de limite sur le nombre de colonnes de recherche
    return true;
  }
} 
