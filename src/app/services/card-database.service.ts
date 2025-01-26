import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  DBConnectionDatabaseSchemaDto,
  DBConnectionDto,
  DataStructureDefinitionDto,
  SQLQueryDto,
  DBConnectionControllerInfoDto,
  DBConnectionEndpointRequestInfoDto,
  DBConnectionEndpointInfoDto
} from '@models/api.models';

@Injectable({
  providedIn: 'root'
})
export class CardDatabaseService {
  constructor(private apiService: ApiService) {}

  getDatasourceContexts(): Observable<string[]> {
    return this.apiService.getDatasourceContexts();
  }

  getDatasourceContextEntities(contextName: string): Observable<DataStructureDefinitionDto[]> {
    return this.apiService.getDatasourceContextEntities(contextName);
  }

  getDatasourceContextEntity(contextName: string, entityName: string): Observable<DataStructureDefinitionDto> {
    return this.apiService.getDatasourceContextEntity(contextName, entityName);
  }

  getSQLQueries(): Observable<SQLQueryDto[]> {
    return this.apiService.getSQLQueries();
  }

  getSQLQuery(id: number): Observable<SQLQueryDto> {
    return this.apiService.getSQLQuery(id);
  }

  getDatabaseSchema(id: number): Observable<DBConnectionDatabaseSchemaDto> {
    return this.apiService.getDatabaseSchema(id);
  }

  getDBConnections(): Observable<DBConnectionDto[]> {
    return this.apiService.getDBConnections();
  }

  getControllers(id: number): Observable<DBConnectionControllerInfoDto[]> {
    return this.apiService.getControllers(id);
  }

  getEndpoints(id: number): Observable<DBConnectionEndpointRequestInfoDto[]> {
    return this.apiService.getEndpoints(id);
  }

  getDatabaseEndpoints(id: number, controller: string | null = null, targetTable: string | null = null, action: string | null = null): Observable<DBConnectionEndpointInfoDto[]> {
    return this.apiService.getDatabaseEndpoints(id, controller, targetTable, action);
  }
} 
