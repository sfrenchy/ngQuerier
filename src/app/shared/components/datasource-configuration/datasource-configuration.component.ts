import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {CardDatabaseService} from '@cards/card-database.service';
import {
  DataStructureDefinitionDto,
  DBConnectionControllerInfoDto,
  DBConnectionDto,
  SQLQueryDto
} from '@models/api.models';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {DatasourceConfig, ParameterValue} from '@models/datasource.models';
import {DatasourceService} from './datasource.service';
import {StoredProcedureParameter} from '@models/parameters.models';
import {LocalDataSourceService} from '@cards/data-table-card/local-datasource.service';
import {Observable} from 'rxjs';
import {RegisteredDataTable} from '@cards/models/registered-data-table.model';
import {take} from 'rxjs/operators';

interface ParameterInfo {
  name: string;
  type: string;
  description?: string;
  userChangeAllowed: boolean;
  required: boolean;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

@Component({
  selector: 'app-datasource-configuration',
  templateUrl: './datasource-configuration.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule
  ]
})
export class DatasourceConfigurationComponent implements OnInit, OnDestroy {
  @Input() config: DatasourceConfig = {type: 'API'};
  @Input() excludeCardId?: number;
  @Output() configChange = new EventEmitter<DatasourceConfig>();
  @Output() schemaChange = new EventEmitter<string>();
  @Input() isChartCard = false;

  datasourceTypes = ['API', 'EntityFramework', 'SQLQuery', 'LocalDataTable'];
  connections: DBConnectionDto[] = [];
  controllers: DBConnectionControllerInfoDto[] = [];
  contexts: string[] = [];
  entities: DataStructureDefinitionDto[] = [];
  queries: SQLQueryDto[] = [];

  // Nouvelles propriétés pour les procédures stockées
  isStoredProcedure = false;
  parametersList: ParameterInfo[] = [];
  dynamicDateTypes = [
    {key: 'specific', label: 'DATASOURCE.DATE_TYPES.SPECIFIC'},
    {key: 'today', label: 'DATASOURCE.DATE_TYPES.TODAY'},
    {key: 'yesterday', label: 'DATASOURCE.DATE_TYPES.YESTERDAY'},
    {key: 'lastWeek', label: 'DATASOURCE.DATE_TYPES.LAST_WEEK'},
    {key: 'lastMonth', label: 'DATASOURCE.DATE_TYPES.LAST_MONTH'},
    {key: 'lastYear', label: 'DATASOURCE.DATE_TYPES.LAST_YEAR'}
  ]
  parameterDateTypes: Record<string, string> = {};

  // Nouvelles propriétés pour la validation
  parameterErrors: Record<string, string> = {};
  hasValidationErrors = false;

  private translateService: TranslateService;
  private localDataSourceService: LocalDataSourceService;

  currentLang: string;
  availableTables$: Observable<RegisteredDataTable[]>;
  sourceTableSchema: any = null;

  isLoadingTables = false;
  tableError?: string;

  constructor(
    private cardDatabaseService: CardDatabaseService,
    private datasourceService: DatasourceService,
    localDataSourceService: LocalDataSourceService,
    translateService: TranslateService
  ) {
    this.translateService = translateService;
    this.localDataSourceService = localDataSourceService;
    this.currentLang = this.translateService.currentLang;
    this.availableTables$ = this.localDataSourceService.getAvailableTables(this.excludeCardId);
  }

  ngOnInit() {
    if (!this.config) {
      this.config = {
        type: 'API',
        isStoredProcedure: false
      };
    }

    // Si on a déjà des paramètres de procédure stockée, initialiser l'interface
    if (this.config.procedureParameters && this.config.controller) {
      this.isStoredProcedure = true;
      this.config.isStoredProcedure = true;
      this.initializeStoredProcedureParameters(this.config.controller);
    }

    this.loadInitialData();
    this.datasourceService.setConfig(this.config);
  }

  private loadInitialData() {
    if (!this.config) return;

    switch (this.config.type) {
      case 'API':
        const savedConnection = this.config.connection;
        const savedController = this.config.controller;

        this.cardDatabaseService.getDBConnections().subscribe(connections => {
          this.connections = connections;
          if (savedConnection) {
            const matchingConnection = connections.find(c => c.id === savedConnection.id);
            if (matchingConnection) {
              this.config.connection = matchingConnection;

              this.cardDatabaseService.getControllers(matchingConnection.id).subscribe(controllers => {
                this.controllers = controllers;
                if (savedController) {
                  const matchingController = controllers.find(c => c.name === savedController.name);
                  if (matchingController) {
                    this.config.controller = matchingController;
                    this.initializeStoredProcedureParameters(matchingController);
                    this.emitChange();
                  }
                }
              });
            }
          }
        });
        break;

      case 'EntityFramework':
        this.loadContexts();
        if (this.config.context) {
          const savedEntity = this.config.entity;
          this.cardDatabaseService.getDatasourceContextEntities(this.config.context).subscribe(
            entities => {
              this.entities = entities;
              if (savedEntity) {
                const matchingEntity = entities.find(e => e.name === savedEntity.name);
                if (matchingEntity) {
                  this.config.entity = matchingEntity;
                  this.emitChange();
                }
              }
            }
          );
        }
        break;

      case 'SQLQuery': {
        // Charger d'abord toutes les requêtes
        this.cardDatabaseService.getSQLQueries().subscribe(queries => {
          this.queries = queries;
          // Si une requête était déjà sélectionnée
          if (this.config.query) {
            const matchingQuery = queries.find(q => q.id === this.config.query?.id);
            if (matchingQuery) {
              this.config.query = matchingQuery;
              this.emitChange();
            }
          }
        });
        break;
      }
    }
  }

  private initializeStoredProcedureParameters(controller: DBConnectionControllerInfoDto) {
    // Vérifier si c'est une procédure stockée
    this.isStoredProcedure = controller?.route?.includes('/procedures/') ?? false;
    this.config.isStoredProcedure = this.isStoredProcedure;  // Mettre à jour la propriété dans la config

    // Si c'est une procédure stockée et qu'il y a un schéma de paramètres
    if (this.isStoredProcedure && controller?.parameterJsonSchema) {
      try {
        const paramSchema = JSON.parse(controller.parameterJsonSchema);

        // Générer la liste des paramètres une seule fois
        if (paramSchema.properties) {
          this.parametersList = Object.entries(paramSchema.properties).map(([name, prop]: [string, any]) => {
            let type = prop.type;
            if (prop.format === 'date' || prop.format === 'date-time') {
              type = prop.format === 'date' ? 'date' : 'datetime';
            }
            return {
              name,
              type,
              description: prop.description,
              userChangeAllowed: prop.userChangeAllowed ?? true,
              required: prop.required ?? false,
              minValue: prop.minimum,
              maxValue: prop.maximum,
              minLength: prop.minLength,
              maxLength: prop.maxLength,
              pattern: prop.pattern
            };
          });

          // Initialiser ou mettre à jour les paramètres en préservant les valeurs existantes
          const parameters: StoredProcedureParameter[] = [];
          Object.entries(paramSchema.properties).forEach(([paramName, prop]: [string, any]) => {
            const existingParam = this.config.procedureParameters?.[paramName];
            const isDateType = prop.type === 'string' && (prop.format === 'date' || prop.format === 'date-time');

            if (!this.config.procedureParameters) {
              this.config.procedureParameters = {};
            }

            const parameter: StoredProcedureParameter = {
              name: paramName,
              type: isDateType ? 'date' : (prop.type as 'string' | 'number' | 'date' | 'boolean' | 'array'),
              value: existingParam?.value ?? (prop.default !== undefined ? prop.default : null),
              dateType: existingParam?.dateType ?? (isDateType ? 'specific' : undefined),
              userChangeAllowed: existingParam?.userChangeAllowed ?? (prop.userChangeAllowed ?? true),
              displayName: prop.title || paramName,
              description: prop.description
            };

            this.config.procedureParameters[paramName] = parameter;
            if (parameter.userChangeAllowed) {
              parameters.push(parameter);
            }
          });

          // Mettre à jour chartParameters pour le panneau latéral
          if (parameters.length > 0) {
            (this.config as any).chartParameters = {
              parameters,
              autoRefreshInterval: 0
            };
          }
        }
      } catch (error) {
        console.error('Erreur lors du parsing du schéma des paramètres:', error);
      }
    }
  }

  onTypeChange(newType: string) {
    this.config = {
      type: newType as 'API' | 'EntityFramework' | 'SQLQuery' | 'LocalDataTable',
      isStoredProcedure: false
    };
    this.loadInitialData();
    this.emitChange();
  }

  loadConnections() {
    this.cardDatabaseService.getDBConnections().subscribe(
      connections => this.connections = connections
    );
  }

  loadControllers(connectionId: number) {
    this.cardDatabaseService.getControllers(connectionId).subscribe(
      controllers => this.controllers = controllers
    );
  }

  loadContexts() {
    this.cardDatabaseService.getDatasourceContexts().subscribe(
      contexts => this.contexts = contexts
    );
  }

  loadEntities(context: string) {
    this.cardDatabaseService.getDatasourceContextEntities(context).subscribe(
      entities => this.entities = entities
    );
  }

  loadQueries() {
    this.cardDatabaseService.getSQLQueries().subscribe(
      queries => this.queries = queries
    );
  }

  onConnectionChange(connection: DBConnectionDto) {
    // Mise à jour directe sans copie
    this.config.type = 'API';
    this.config.connection = connection;  // Assignation directe
    this.config.controller = undefined;

    this.cardDatabaseService.getControllers(connection.id).subscribe(controllers => {
      this.controllers = controllers;
      this.emitChange();
    });
  }

  onControllerChange(controller: DBConnectionControllerInfoDto) {
    this.config.controller = controller;

    // Vérifier si c'est une procédure stockée
    const wasStoredProcedure = this.isStoredProcedure;
    this.isStoredProcedure = controller?.route?.includes('/procedures/') ?? false;
    this.config.isStoredProcedure = this.isStoredProcedure;  // Mettre à jour la propriété dans la config

    // Réinitialiser les paramètres seulement si nécessaire
    if (this.isStoredProcedure || wasStoredProcedure) {
      this.config.procedureParameters = {};
      this.parametersList = [];
    }

    // Si c'est une procédure stockée et qu'il y a un schéma de paramètres
    if (this.isStoredProcedure && controller?.parameterJsonSchema) {
      try {
        const paramSchema = JSON.parse(controller.parameterJsonSchema);

        // Générer la liste des paramètres une seule fois
        if (paramSchema.properties) {
          this.parametersList = Object.entries(paramSchema.properties).map(([name, prop]: [string, any]) => {
            let type = prop.type;
            if (prop.format === 'date' || prop.format === 'date-time') {
              type = prop.format === 'date' ? 'date' : 'datetime';
            }
            return {
              name,
              type,
              description: prop.description,
              userChangeAllowed: prop.userChangeAllowed ?? true,
              required: prop.required ?? false,
              minValue: prop.minimum,
              maxValue: prop.maximum,
              minLength: prop.minLength,
              maxLength: prop.maxLength,
              pattern: prop.pattern
            };
          });

          // Initialiser ou mettre à jour les paramètres en préservant les valeurs existantes
          const parameters: StoredProcedureParameter[] = [];
          Object.entries(paramSchema.properties).forEach(([paramName, prop]: [string, any]) => {
            const existingParam = this.config.procedureParameters?.[paramName];
            const isDateType = prop.type === 'string' && (prop.format === 'date' || prop.format === 'date-time');

            if (!this.config.procedureParameters) {
              this.config.procedureParameters = {};
            }

            const parameter: StoredProcedureParameter = {
              name: paramName,
              type: isDateType ? 'date' : (prop.type as 'string' | 'number' | 'date' | 'boolean' | 'array'),
              value: existingParam?.value ?? (prop.default !== undefined ? prop.default : null),
              dateType: existingParam?.dateType ?? (isDateType ? 'specific' : undefined),
              userChangeAllowed: existingParam?.userChangeAllowed ?? (prop.userChangeAllowed ?? true),
              displayName: prop.title || paramName,
              description: prop.description
            };

            this.config.procedureParameters[paramName] = parameter;
            if (parameter.userChangeAllowed) {
              parameters.push(parameter);
            }
          });

          // Mettre à jour chartParameters pour le panneau latéral
          if (parameters.length > 0) {
            (this.config as any).chartParameters = {
              parameters,
              autoRefreshInterval: 0
            };
          }
        }
      } catch (error) {
        console.error('Erreur lors du parsing du schéma des paramètres:', error);
      }
    }

    // Émettre les changements une seule fois
    this.configChange.emit(this.config);
    this.emitSchema();
  }

  onContextChange(context: string) {
    this.config.context = context;
    const savedEntity = this.config.entity;
    this.loadEntities(context);

    if (savedEntity) {
      this.cardDatabaseService.getDatasourceContextEntities(context).subscribe(
        entities => {
          this.entities = entities;
          const matchingEntity = entities.find(e => e.name === savedEntity.name);
          if (matchingEntity) {
            this.config.entity = matchingEntity;
            this.emitChange();
          }
        }
      );
    } else {
      this.loadEntities(context);
      this.emitChange();
    }
  }

  onEntityChange(entity: DataStructureDefinitionDto) {
    this.config.entity = entity;
    this.emitChange();
  }

  onQueryChange(query: SQLQueryDto) {
    this.config.query = query;
    this.emitChange();
  }

  getParametersList(): ParameterInfo[] {
    return this.parametersList;  // Retourner la liste mise en cache
  }

  onDateTypeChange(paramName: string, dateType: string) {
    if (!this.config.procedureParameters?.[paramName]) {
      return;
    }

    const paramValue = this.config.procedureParameters[paramName];
    paramValue.dateType = dateType as ParameterValue['dateType'];

    if (dateType !== 'specific') {
      const date = new Date();

      switch (dateType) {
        case 'today':
          break;
        case 'yesterday':
          date.setDate(date.getDate() - 1);
          break;
        case 'lastWeek':
          date.setDate(date.getDate() - 7);
          break;
        case 'lastMonth':
          date.setMonth(date.getMonth() - 1);
          break;
        case 'lastYear':
          date.setFullYear(date.getFullYear() - 1);
          break;
      }

      paramValue.value = date.toISOString().split('T')[0];
    }

    this.emitChange(false);
  }

  onUserChangeAllowedChange(paramName: string, event: Event) {
    if (!this.config.procedureParameters) {
      this.config.procedureParameters = {};
    }

    // Créer un nouvel objet ParameterValue si nécessaire
    if (!this.config.procedureParameters[paramName] || typeof this.config.procedureParameters[paramName] !== 'object') {
      this.config.procedureParameters[paramName] = {
        name: paramName,
        type: 'string',
        value: null,
        userChangeAllowed: true
      };
    }

    const target = event.target as HTMLInputElement;
    this.config.procedureParameters[paramName].userChangeAllowed = target.checked;

    // Ne pas reformater les paramètres lors du changement de userChangeAllowed
    this.configChange.emit(this.config);
  }

  validateParameters(): boolean {
    this.parameterErrors = {};
    this.hasValidationErrors = false;

    if (!this.isStoredProcedure || !this.config.procedureParameters) {
      return true;
    }

    this.parametersList.forEach(param => {
      const paramValue = this.config.procedureParameters?.[param.name];
      const value = paramValue?.value;
      const errors: string[] = [];

      // Vérification des champs requis
      if (param.required && (value === null || value === undefined || value === '')) {
        errors.push('Ce champ est requis');
      }

      if (value !== null && value !== undefined && value !== '') {
        // Validation du type
        switch (param.type) {
          case 'number':
            const numValue = Number(value);
            if (isNaN(numValue)) {
              errors.push('La valeur doit être un nombre');
            } else {
              if (param.minValue !== undefined && numValue < param.minValue) {
                errors.push(`La valeur minimale est ${param.minValue}`);
              }
              if (param.maxValue !== undefined && numValue > param.maxValue) {
                errors.push(`La valeur maximale est ${param.maxValue}`);
              }
            }
            break;

          case 'string':
            const strValue = String(value);
            if (param.minLength !== undefined && strValue.length < param.minLength) {
              errors.push(`La longueur minimale est ${param.minLength} caractères`);
            }
            if (param.maxLength !== undefined && strValue.length > param.maxLength) {
              errors.push(`La longueur maximale est ${param.maxLength} caractères`);
            }
            if (param.pattern) {
              const regex = new RegExp(param.pattern);
              if (!regex.test(strValue)) {
                errors.push('Le format est invalide');
              }
            }
            break;

          case 'date':
          case 'datetime':
            if (paramValue?.dateType === 'specific') {
              const dateValue = new Date(value);
              if (isNaN(dateValue.getTime())) {
                errors.push('La date est invalide');
              }
            }
            break;
        }
      }

      if (errors.length > 0) {
        this.parameterErrors[param.name] = errors.join('. ');
        this.hasValidationErrors = true;
      }
    });

    return !this.hasValidationErrors;
  }

  onParameterValueChange(paramName: string, value: any) {
    if (!this.config.procedureParameters) {
      this.config.procedureParameters = {};
    }

    // Créer un nouvel objet ParameterValue si nécessaire
    if (!this.config.procedureParameters[paramName] || typeof this.config.procedureParameters[paramName] !== 'object') {
      this.config.procedureParameters[paramName] = {
        name: paramName,
        type: 'string',
        value: null,
        userChangeAllowed: true
      };
    }

    // Mettre à jour la valeur
    this.config.procedureParameters[paramName].value = value;

    // Valider le paramètre modifié
    this.validateParameters();

    // Ne pas reformater les paramètres lors du changement de valeur
    this.configChange.emit(this.config);
  }

  private formatParameterValues(): Record<string, any> {
    const formattedParams: Record<string, any> = {};

    if (!this.isStoredProcedure || !this.config.controller?.parameterJsonSchema || !this.config.procedureParameters) {
      return {};
    }

    try {
      const paramSchema = JSON.parse(this.config.controller.parameterJsonSchema);
      if (!paramSchema.properties) {
        return {};
      }

      // Copier les valeurs existantes
      Object.entries(this.config.procedureParameters).forEach(([name, paramValue]) => {
        if (paramValue && typeof paramValue === 'object') {
          formattedParams[name] = paramValue.value;
        }
      });

      return formattedParams;
    } catch (error) {
      console.error('Erreur lors du formatage des paramètres:', error);
      return {};
    }
  }

  emitChange(recreateConfig: boolean = true) {
    // Émettre directement la config sans créer de copie
    this.configChange.emit(this.config);

    if (this.config.controller?.parameterJsonSchema) {
      this.schemaChange.emit(this.config.controller.parameterJsonSchema);
    }
  }

  private emitSchema() {
    let schema: string | undefined;

    switch (this.config.type) {
      case 'API':
        schema = this.config.controller?.responseEntityJsonSchema;
        break;
      case 'EntityFramework':
        schema = this.config.entity?.jsonSchema;
        break;
      case 'SQLQuery':
        schema = this.config.query?.outputDescription;
        break;
      case 'LocalDataTable':
        if (this.sourceTableSchema) {
          schema = JSON.stringify(this.sourceTableSchema);
        }
        break;
    }

    if (schema) {
      this.schemaChange.emit(schema);
    }
  }

  onSourceTableChange(cardId: number) {
    if (cardId) {
      this.sourceTableSchema = this.localDataSourceService.getTableSchema(cardId);

      if (!this.sourceTableSchema) {
        return;
      }

      if (!this.config.localDataTable) {
        this.config.localDataTable = {
          cardId,
          useFilteredData: false,
          columns: []
        };
      } else {
        this.config.localDataTable.cardId = cardId;
      }
      this.emitSchema();
    } else {
      this.sourceTableSchema = null;
    }
    this.onConfigChange();
  }

  getSchemaColumns(): Array<{ key: string, title: string }> {
    if (!this.sourceTableSchema?.properties) return [];
    return Object.entries(this.sourceTableSchema.properties).map(([key, prop]: [string, any]) => ({
      key,
      title: prop.title || key
    }));
  }

  isColumnSelected(columnKey: string): boolean {
    return this.config.localDataTable?.columns?.includes(columnKey) ?? false;
  }

  toggleColumn(columnKey: string) {
    if (!this.config.localDataTable) return;

    const columns = this.config.localDataTable.columns || [];
    const index = columns.indexOf(columnKey);

    if (index === -1) {
      columns.push(columnKey);
    } else {
      columns.splice(index, 1);
    }

    this.config.localDataTable.columns = columns;
    this.onConfigChange();
  }

  onConfigChange() {
    this.configChange.emit(this.config);
    this.emitSchema();
  }

  initLocalDataTable(): DatasourceConfig['localDataTable'] {
    if (!this.config.localDataTable) {
      this.config.localDataTable = {
        cardId: 0,
        useFilteredData: false,
        columns: []
      };
    }
    return this.config.localDataTable;
  }

  getTableTitle(table: RegisteredDataTable): string {
    // Si title est un tableau, prendre le premier élément
    if (Array.isArray(table.title)) {
      return table.title[0].value || 'Unknown';
    }

    // Sinon c'est un objet TranslatableString, prendre la valeur pour la langue courante
    const title = table.title[this.currentLang as keyof typeof table.title];
    return (typeof title === 'string' ? title : 'Unknown');
  }

  getTableStatus(cardId: number): string {
    let status = 'COMMON.LOADING';
    this.localDataSourceService.getTableReadyState$(cardId)
      .pipe(take(1))
      .subscribe(state => {
        if (state.error) {
          status = 'DATASOURCE.LOCAL_TABLE.ERROR';
        } else if (!state.isSchemaReady) {
          status = 'DATASOURCE.LOCAL_TABLE.LOADING_SCHEMA';
        } else if (!state.isDataReady) {
          status = 'DATASOURCE.LOCAL_TABLE.LOADING_DATA';
        }
      });
    return status;
  }

  getTableTooltip(cardId: number): string {
    let tooltip = '';
    this.localDataSourceService.getTableReadyState$(cardId)
      .pipe(take(1))
      .subscribe(state => {
        if (state.error) {
          tooltip = state.error;
        } else if (!state.isSchemaReady) {
          tooltip = this.translateService.instant('DATASOURCE.LOCAL_TABLE.SCHEMA_LOADING_INFO');
        } else if (!state.isDataReady) {
          tooltip = this.translateService.instant('DATASOURCE.LOCAL_TABLE.DATA_LOADING_INFO');
        }
      });
    return tooltip;
  }

  onTableSelect(cardId: number | null): void {
    if (!this.config) return;

    if (cardId === null) {
      // Nettoyage complet lors de la désélection
      this.cleanupTableSelection();
    } else {
      this.config.localDataTable = {
        cardId,
        useFilteredData: false,
        columns: []
      };
      // Observer l'état de la table sélectionnée
      this.localDataSourceService.getTableReadyState$(cardId)
        .pipe(take(1))
        .subscribe(state => {
          if (state.error) {
            this.tableError = state.error;
          } else {
            this.tableError = undefined;
          }
        });
    }

    this.configChange.emit(this.config);
  }

  private cleanupTableSelection(): void {
    if (this.config) {
      this.config.localDataTable = undefined;
      this.sourceTableSchema = null;
      this.tableError = undefined;
    }
  }

  // Réajouter la méthode isTableReady
  isTableReady(cardId: number): boolean {
    let isReady = false;
    this.localDataSourceService.getTableReadyState$(cardId)
      .pipe(take(1))
      .subscribe(state => {
        isReady = state.isSchemaReady && state.isDataReady && !state.error;
      });
    return isReady;
  }

  // Ajouter la méthode ngOnDestroy requise par l'interface
  ngOnDestroy(): void {
    // Nettoyer les souscriptions si nécessaire
  }
}
