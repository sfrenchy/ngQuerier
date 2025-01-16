import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardDatabaseService } from '@services/card-database.service';
import { DBConnectionDto, DBConnectionControllerInfoDto, EntityDefinitionDto, SQLQueryDto } from '@models/api.models';
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
  entities: EntityDefinitionDto[] = [];
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
        this.loadConnections();
        if (this.config.connection) {
          this.loadControllers(this.config.connection.id);
        }
        break;
      case 'EntityFramework':
        this.loadContexts();
        if (this.config.context) {
          this.loadEntities(this.config.context);
        }
        break;
      case 'SQLQuery':
        this.loadQueries();
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
    this.config.controller = undefined;
    this.loadControllers(connection.id);
    this.emitChange();
  }

  onControllerChange(controller: DBConnectionControllerInfoDto) {
    this.config.controller = controller;
    this.emitChange();
  }

  onContextChange(context: string) {
    this.config.context = context;
    this.config.entity = undefined;
    this.loadEntities(context);
    this.emitChange();
  }

  onEntityChange(entity: EntityDefinitionDto) {
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