import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { CardDatabaseService } from '@services/card-database.service';
import { DatasourceConfig } from '@models/datasource.models';
import { DataTableCardConfig } from './data-table-card.models';

export interface ForeignKeyDisplayConfig {
  table: string;
  displayColumns: string[];
  displayFormat?: string;  // Ex: "{firstName} {lastName} ({email})"
  searchColumns?: string[]; // Colonnes à utiliser pour la recherche
}

export interface ForeignKeyOption {
  id: any;
  display: string;
  details?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ForeignKeyService {
  private schemaCache = new Map<string, any>();
  private config: DataTableCardConfig | undefined;
  private readonly CONVENTIONAL_NAMES = [
    'name', 'label', 'title', 'description',
    'firstName', 'lastName', 'email',
    'code', 'reference'
  ];

  constructor(private cardDatabaseService: CardDatabaseService) {}

  setConfig(config: DataTableCardConfig) {
    this.config = config;
  }

  private detectDisplayColumns(tableSchema: any): string[] {
    const properties = tableSchema.properties;
    const columns: string[] = [];

    // 1. Chercher les colonnes conventionnelles
    this.CONVENTIONAL_NAMES.forEach(name => {
      const matchingColumns = Object.keys(properties).filter(key => 
        key.toLowerCase().includes(name.toLowerCase()) &&
        properties[key].type === 'string'
      );
      columns.push(...matchingColumns);
    });

    // 2. Ajouter la première colonne string non-ID si rien n'a été trouvé
    if (columns.length === 0) {
      const firstStringColumn = Object.entries(properties)
        .find(([key, prop]: [string, any]) => 
          prop.type === 'string' && 
          !key.toLowerCase().includes('id') &&
          !prop['x-entity-metadata']?.isPrimaryKey
        );
      if (firstStringColumn) {
        columns.push(firstStringColumn[0]);
      }
    }

    return [...new Set(columns)]; // Éliminer les doublons
  }

  formatDisplay(item: Record<string, any>, columns: string[], format?: string): string {
    if (format) {
      // Créer un map insensible à la casse des propriétés
      const itemKeys = Object.keys(item).reduce((acc, key) => {
        acc[key.toLowerCase()] = key;
        return acc;
      }, {} as { [key: string]: string });

      return format.replace(/\{(\w+)\}/g, (match, column) => {
        // Chercher la propriété de manière insensible à la casse
        const actualKey = itemKeys[column.toLowerCase()] || column;
        return item[actualKey] || '';
      });
    }

    return columns
      .map(col => {
        // Chercher la propriété de manière insensible à la casse
        const actualKey = Object.keys(item).find(key => key.toLowerCase() === col.toLowerCase()) || col;
        return item[actualKey] || null;
      })
      .filter(val => val != null)
      .join(' - ');
  }

  async getForeignKeyOptions(
    tableName: string,
    keyColumn: string,
    config?: ForeignKeyDisplayConfig,
    searchTerm?: string
  ): Promise<ForeignKeyOption[]> {
    if (!this.config?.datasource?.connection?.id) {
      return [];
    }

    // 1. Obtenir les endpoints pour la table
    const endpoints = await this.cardDatabaseService.getDatabaseEndpoints(
      this.config.datasource.connection.id,
      null,
      tableName,
      'GetAll'
    ).toPromise();

    if (!endpoints || endpoints.length === 0) {
      return [];
    }

    // 2. Créer une configuration de source de données pour la table
    const foreignKeyDatasource: DatasourceConfig = {
      type: 'API',
      connection: this.config.datasource.connection,
      controller: {
        name: tableName,
        route: endpoints[0].route
      }
    };

    // 3. Construire les paramètres de recherche
    const searchParams = {
      pageNumber: 1,
      pageSize: 1000,
      orderBy: [],
      globalSearch: searchTerm || '',
      columnSearches: []
    };

    // 4. Récupérer les données
    const response = await this.cardDatabaseService.fetchData(
      foreignKeyDatasource,
      searchParams
    ).toPromise();

    if (!response?.items) {
      return [];
    }

    // 5. Formater les résultats
    return response.items.map((item: Record<string, any>) => ({
      id: item[keyColumn],
      display: this.formatDisplay(item, config?.displayColumns || [], config?.displayFormat),
      details: item
    }));
  }

  clearCache(tableName?: string): void {
    if (tableName) {
      this.schemaCache.delete(tableName);
    } else {
      this.schemaCache.clear();
    }
  }
} 