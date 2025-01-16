import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  DBConnectionDatabaseSchemaDto,
  DBConnectionDto,
  EntityDefinitionDto,
  PaginationParametersDto,
  PaginatedResultDto,
  SQLQueryDto
} from '@models/api.models';

@Injectable({
  providedIn: 'root'
})
export class CardDatabaseService {
  constructor(private apiService: ApiService) {}

  getDatasourceContexts(): Observable<string[]> {
    return this.apiService.getDatasourceContexts();
  }

  getDatasourceContextEntities(contextName: string): Observable<EntityDefinitionDto[]> {
    return this.apiService.getDatasourceContextEntities(contextName);
  }

  getDatasourceContextEntity(contextName: string, entityName: string): Observable<EntityDefinitionDto> {
    return this.apiService.getDatasourceContextEntity(contextName, entityName);
  }

  getEntityRecords(
    contextName: string,
    entityName: string,
    paginationParameters: PaginationParametersDto,
    orderBy: string = ''
  ): Observable<{ items: any[]; total: number }> {
    return this.apiService.getEntityRecords(contextName, entityName, paginationParameters, orderBy);
  }

  getSQLQueries(): Observable<SQLQueryDto[]> {
    return this.apiService.getSQLQueries();
  }

  getSQLQuery(id: number): Observable<SQLQueryDto> {
    return this.apiService.getSQLQuery(id);
  }

  executeQuery(
    queryName: string,
    pageNumber: number = 1,
    pageSize: number = 0
  ): Observable<{ items: any[]; total: number }> {
    return this.apiService.executeQuery(queryName, pageNumber, pageSize);
  }

  getDatabaseSchema(id: number): Observable<DBConnectionDatabaseSchemaDto> {
    return this.apiService.getDatabaseSchema(id);
  }

  getDBConnections(): Observable<DBConnectionDto[]> {
    return this.apiService.getDBConnections();
  }
} 