import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardDatabaseService } from '@services/card-database.service';
import { DBConnectionDto, DBConnectionControllerInfoDto, SQLQueryDto, DataStructureDefinitionDto } from '@models/api.models';
import { TranslateModule } from '@ngx-translate/core';
import { DatasourceConfig, ParameterValue } from '@models/datasource.models';
import { DatasourceService } from './datasource.service';
import { StoredProcedureParameter, ChartParameters } from '@models/parameters.models';

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
export class DatasourceConfigurationComponent implements OnInit {
  @Input() config: DatasourceConfig = { type: 'API' };
  @Output() configChange = new EventEmitter<DatasourceConfig>();
  @Output() schemaChange = new EventEmitter<string>();

  datasourceTypes = ['API', 'EntityFramework', 'SQLQuery'];
  connections: DBConnectionDto[] = [];
  controllers: DBConnectionControllerInfoDto[] = [];
  contexts: string[] = [];
  entities: DataStructureDefinitionDto[] = [];
  queries: SQLQueryDto[] = [];

  // Nouvelles propriétés pour les procédures stockées
  isStoredProcedure = false;
  parametersList: ParameterInfo[] = [];
  dynamicDateTypes = [
    { key: 'specific', label: 'DATASOURCE.DATE_TYPES.SPECIFIC' },
    { key: 'today', label: 'DATASOURCE.DATE_TYPES.TODAY' },
    { key: 'yesterday', label: 'DATASOURCE.DATE_TYPES.YESTERDAY' },
    { key: 'lastWeek', label: 'DATASOURCE.DATE_TYPES.LAST_WEEK' },
    { key: 'lastMonth', label: 'DATASOURCE.DATE_TYPES.LAST_MONTH' },
    { key: 'lastYear', label: 'DATASOURCE.DATE_TYPES.LAST_YEAR' }
  ]
  parameterDateTypes: Record<string, string> = {};

  // Nouvelles propriétés pour la validation
  parameterErrors: Record<string, string> = {};
  hasValidationErrors = false;

  constructor(
    private cardDatabaseService: CardDatabaseService,
    private datasourceService: DatasourceService
  ) {}

  ngOnInit() {
    if (!this.config) {
      this.config = { 
        type: 'API',
        isStoredProcedure: false  // Initialiser à false par défaut
      };
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

      case 'SQLQuery':
        const savedQuery = this.config.query;
        this.cardDatabaseService.getSQLQueries().subscribe(queries => {
          this.queries = queries;
          if (savedQuery) {
            const matchingQuery = queries.find(q => q.id === savedQuery.id);
            if (matchingQuery) {
              this.config.query = matchingQuery;
              this.emitChange();
            }
          }
        });
        break;
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
          
          // Initialiser les paramètres avec des valeurs par défaut
          const parameters: StoredProcedureParameter[] = [];
            Object.entries(paramSchema.properties).forEach(([paramName, prop]: [string, any]) => {
              const defaultValue = prop.default !== undefined ? prop.default : null;
              const isDateType = prop.type === 'string' && (prop.format === 'date' || prop.format === 'date-time');
              
            if (!this.config.procedureParameters) {
              this.config.procedureParameters = {};
            }
            
            const parameter: StoredProcedureParameter = {
              name: paramName,
              type: isDateType ? 'date' : (prop.type as 'string' | 'number' | 'date' | 'boolean' | 'array'),
                value: defaultValue,
                dateType: isDateType ? 'specific' : undefined,
              userChangeAllowed: prop.userChangeAllowed ?? true,
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

  onTypeChange() {
    // Reset configuration except type
    this.config = { 
      type: this.config.type,
      isStoredProcedure: false  // Initialiser à false par défaut
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
    this.config.connection = connection;
    const savedController = this.config.controller;
    this.config.controller = undefined;
    
    this.cardDatabaseService.getControllers(connection.id).subscribe(controllers => {
      this.controllers = controllers;
      if (savedController) {
        const matchingController = controllers.find(c => c.name === savedController.name);
        if (matchingController) {
          this.config.controller = matchingController;
        }
      }
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
          
          // Initialiser les paramètres avec des valeurs par défaut
          const parameters: StoredProcedureParameter[] = [];
          Object.entries(paramSchema.properties).forEach(([paramName, prop]: [string, any]) => {
            const defaultValue = prop.default !== undefined ? prop.default : null;
            const isDateType = prop.type === 'string' && (prop.format === 'date' || prop.format === 'date-time');
            
            if (!this.config.procedureParameters) {
              this.config.procedureParameters = {};
            }
            
            const parameter: StoredProcedureParameter = {
              name: paramName,
              type: isDateType ? 'date' : (prop.type as 'string' | 'number' | 'date' | 'boolean' | 'array'),
              value: defaultValue,
              dateType: isDateType ? 'specific' : undefined,
              userChangeAllowed: prop.userChangeAllowed ?? true,
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
    if (this.isStoredProcedure && recreateConfig) {
      // Ne pas reformater les paramètres, garder les valeurs telles quelles
      this.configChange.emit(this.config);
      this.emitSchema();
    } else {
      this.configChange.emit(this.config);
      this.emitSchema();
    }
    // Mettre à jour la configuration dans le service
    this.datasourceService.setConfig(this.config);
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
    }

    if (schema) {
      this.schemaChange.emit(schema);
    }
  }
} 