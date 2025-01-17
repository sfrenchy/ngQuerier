import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  DBConnectionDatabaseSchemaDto,
  DBConnectionDto,
  DataStructureDefinitionDto,
  PaginationParametersDto,
  PaginatedResultDto,
  SQLQueryDto,
  DBConnectionControllerInfoDto,
  DBConnectionEndpointRequestInfoDto
} from '@models/api.models';
import { DatasourceConfig } from '@models/datasource.models';

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

  getEntityRecords(
    contextName: string,
    entityName: string,
    paginationParameters: PaginationParametersDto,
    orderBy: string = ''
  ): Observable<PaginatedResultDto<any>> {
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
  ): Observable<PaginatedResultDto<any>> {
    return this.apiService.executeQuery(queryName, pageNumber, pageSize);
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

  /**
   * Récupère les données selon la configuration de la source de données
   * @param config Configuration de la source de données
   * @param paginationParameters Paramètres de pagination optionnels
   * @returns Observable des données paginées
   */
  fetchData(
    config: DatasourceConfig,
    paginationParameters: PaginationParametersDto = { pageNumber: 1, pageSize: 10 }
  ): Observable<PaginatedResultDto<any>> {
    switch (config.type) {
      case 'API':
        if (!config.connection || !config.controller) {
          throw new Error('API configuration requires both connection and controller');
        }
        // TODO: Implémenter l'appel API via le contrôleur sélectionné
        // Pour l'instant, on retourne un Observable vide
        throw new Error('API calls not implemented yet');

      case 'EntityFramework':
        if (!config.context || !config.entity) {
          throw new Error('EntityFramework configuration requires both context and entity');
        }
        return this.getEntityRecords(
          config.context,
          config.entity.name,
          paginationParameters
        );

      case 'SQLQuery':
        if (!config.query) {
          throw new Error('SQLQuery configuration requires a query');
        }
        return this.executeQuery(
          config.query.name,
          paginationParameters.pageNumber,
          paginationParameters.pageSize
        );

      default:
        throw new Error(`Unsupported datasource type: ${config.type}`);
    }
  }
} 
