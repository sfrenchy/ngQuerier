import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { CardDatabaseService } from '@services/card-database.service';

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
  private readonly CONVENTIONAL_NAMES = [
    'name', 'label', 'title', 'description',
    'firstName', 'lastName', 'email',
    'code', 'reference'
  ];

  constructor(private cardDatabaseService: CardDatabaseService) {}

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

  private formatDisplay(item: any, columns: string[], format?: string): string {
    if (format) {
      return format.replace(/\{(\w+)\}/g, (match, column) => item[column] || '');
    }

    return columns
      .map(col => item[col])
      .filter(val => val != null)
      .join(' - ');
  }

  async getForeignKeyOptions(
    tableName: string,
    keyColumn: string,
    config?: ForeignKeyDisplayConfig,
    searchTerm?: string
  ): Promise<ForeignKeyOption[]> {
    // 1. Obtenir le schéma de la table si pas en cache
    if (!this.schemaCache.has(tableName)) {
      const schema = await this.cardDatabaseService.getTableSchema(tableName).toPromise();
      this.schemaCache.set(tableName, schema);
    }
    const tableSchema = this.schemaCache.get(tableName);

    // 2. Déterminer les colonnes à afficher
    const displayColumns = config?.displayColumns || 
                         tableSchema['x-entity-metadata']?.displayColumns ||
                         this.detectDisplayColumns(tableSchema);

    // 3. Construire la requête de recherche
    const searchColumns = config?.searchColumns || displayColumns;
    const searchParams = searchTerm ? {
      columns: searchColumns,
      term: searchTerm
    } : undefined;

    // 4. Récupérer les données
    const items = await this.cardDatabaseService.getForeignKeyValues(
      tableName,
      keyColumn,
      searchParams
    ).toPromise();

    // 5. Formater les résultats
    return items.map(item => ({
      id: item[keyColumn],
      display: this.formatDisplay(item, displayColumns, config?.displayFormat),
      details: item // Garder toutes les données pour un affichage détaillé si nécessaire
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