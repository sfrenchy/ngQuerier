import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardDatabaseService } from '@services/card-database.service';
import { DBConnectionDto, DBConnectionControllerInfoDto, SQLQueryDto, DataStructureDefinitionDto } from '@models/api.models';
import { TranslateModule } from '@ngx-translate/core';
import { DatasourceConfig } from '@models/datasource.models';

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

  datasourceTypes = ['API', 'EntityFramework', 'SQLQuery'];
  connections: DBConnectionDto[] = [];
  controllers: DBConnectionControllerInfoDto[] = [];
  contexts: string[] = [];
  entities: DataStructureDefinitionDto[] = [];
  queries: SQLQueryDto[] = [];

  constructor(private cardDatabaseService: CardDatabaseService) {}

  ngOnInit() {
    if (!this.config) {
      this.config = { type: 'API' };
    }
    this.loadInitialData();
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

  onTypeChange() {
    // Reset configuration except type
    this.config = { type: this.config.type };
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
    this.emitChange();
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

  private emitChange() {
    this.configChange.emit(this.config);
  }
} 