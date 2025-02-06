import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { RegisteredDataTable, TableDataEvent } from './data-table-card.models';

// Ajouter cette interface en haut du fichier
interface TableReadyState {
  isSchemaReady: boolean;
  isDataReady: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocalDataSourceService {
  private registeredTables = new Map<number, RegisteredDataTable>();
  private availableTablesSubject = new BehaviorSubject<RegisteredDataTable[]>([]);
  private tableDataSubjects = new Map<number, BehaviorSubject<TableDataEvent | null>>();
  private destroySubjects = new Map<number, Subject<void>>();
  private registeredTableCache = new Map<number, RegisteredDataTable>();
  private tableReadyStates = new Map<number, BehaviorSubject<TableReadyState>>();

  constructor() {}

  // Enregistrer une nouvelle table comme source de données
  registerDataTable(table: RegisteredDataTable): void {
    console.log('[LocalDataSourceService] Registering table:', {
      cardId: table.cardId,
      title: table.title,
      schema: table.schema,
      hasData: !!table.currentData$
    });

    try {
      const readyState = this.tableReadyStates.get(table.cardId) ||
        new BehaviorSubject<TableReadyState>({
          isSchemaReady: false,
          isDataReady: false
        });

      // Mettre à jour l'état du schéma
      if (table.schema) {
        readyState.next({
          ...readyState.value,
          isSchemaReady: true,
          error: undefined // Effacer les erreurs précédentes
        });
      } else {
        readyState.next({
          ...readyState.value,
          isSchemaReady: false,
          error: 'Schema is missing'
        });
      }

      this.tableReadyStates.set(table.cardId, readyState);

      // Si la table existe déjà dans le cache, garder son ID original
      const existingTable = Array.from(this.registeredTableCache.values())
        .find(t => t.title === table.title);

      if (existingTable) {
        table = { ...table, cardId: existingTable.cardId };
      }

      // Mettre en cache
      this.registeredTableCache.set(table.cardId, table);

      // Créer un nouveau subject pour les données de cette table
      const dataSubject = new BehaviorSubject<TableDataEvent | null>(null);
      const destroySubject = new Subject<void>();

      // S'abonner aux données de la table
      table.currentData$
        .pipe(takeUntil(destroySubject))
        .subscribe({
          next: (data) => {
            console.log('[LocalDataSourceService] New data received for table:', {
              cardId: table.cardId,
              dataLength: data?.data?.length,
              hasFilters: !!data?.filters,
              hasSorting: !!data?.sorting
            });
            dataSubject.next(data);
            // Mettre à jour l'état des données
            readyState.next({
              ...readyState.value,
              isDataReady: true,
              error: undefined
            });
          },
          error: (error) => {
            console.error('[LocalDataSourceService] Error receiving data:', error);
            readyState.next({
              ...readyState.value,
              isDataReady: false,
              error: error.message || 'Error loading data'
            });
          }
        });

      // Stocker les références
      this.registeredTables.set(table.cardId, table);
      this.tableDataSubjects.set(table.cardId, dataSubject);
      this.destroySubjects.set(table.cardId, destroySubject);

      console.log('[LocalDataSourceService] Current registered tables:',
        Array.from(this.registeredTables.entries()).map(([id, t]) => ({
          cardId: id,
          title: t.title
        }))
      );

      this.updateAvailableTables();

      // Marquer la table comme prête
      const readySubject = this.tableReadyStates.get(table.cardId);
      if (readySubject) {
        readySubject.next({
          isSchemaReady: true,
          isDataReady: true
        });
      }
    } catch (error) {
      console.error('[LocalDataSourceService] Error registering table:', error);
      const readyState = this.tableReadyStates.get(table.cardId);
      if (readyState) {
        readyState.next({
          isSchemaReady: false,
          isDataReady: false,
          error: error instanceof Error ? error.message : 'Unknown error during registration'
        });
      }
    }
  }

  // Désenregistrer une table
  unregisterDataTable(cardId: number): void {
    console.log('[LocalDataSourceService] Unregistering table:', cardId);
    // Nettoyer les souscriptions
    const destroySubject = this.destroySubjects.get(cardId);
    if (destroySubject) {
      destroySubject.next();
      destroySubject.complete();
      this.destroySubjects.delete(cardId);
    }

    // Nettoyer les subjects de données
    const dataSubject = this.tableDataSubjects.get(cardId);
    if (dataSubject) {
      dataSubject.complete();
      this.tableDataSubjects.delete(cardId);
    }

    // Supprimer la table du registre
    this.registeredTables.delete(cardId);
    this.updateAvailableTables();
  }

  // Obtenir la liste des tables disponibles (excluant éventuellement une table spécifique)
  getAvailableTables(excludeCardId?: number): Observable<RegisteredDataTable[]> {
    return this.availableTablesSubject.pipe(
      map(tables => {
        // Combiner les tables actives et en cache
        const allTables = new Map([
          ...this.registeredTables,
          ...this.registeredTableCache
        ]);
        return Array.from(allTables.values())
          .filter(table => table.cardId !== excludeCardId);
      })
    );
  }

  // Obtenir une table spécifique
  getDataTable(cardId: number): RegisteredDataTable | undefined {
    return this.registeredTables.get(cardId);
  }

  // Obtenir le flux de données d'une table spécifique
  getTableData(cardId: number): Observable<TableDataEvent | null> | undefined {
    // Chercher d'abord dans les tables actives
    const subject = this.tableDataSubjects.get(cardId);
    if (subject) return subject.asObservable();

    // Si pas trouvé, réenregistrer depuis le cache
    const cachedTable = this.registeredTableCache.get(cardId);
    if (cachedTable) {
      this.registerDataTable(cachedTable);
      return this.tableDataSubjects.get(cardId)?.asObservable();
    }

    return undefined;
  }

  // Obtenir le schéma d'une table spécifique
  getTableSchema(cardId: number): any | undefined {
    // Chercher d'abord dans le cache
    const table = this.registeredTables.get(cardId) || this.registeredTableCache.get(cardId);
    return table?.schema;
  }

  // Vérifier si une table est disponible
  isTableAvailable(cardId: number): boolean {
    return this.registeredTables.has(cardId);
  }

  private updateAvailableTables(): void {
    // Mettre à jour avec toutes les tables (actives + cache)
    const allTables = new Map([
      ...this.registeredTables,
      ...this.registeredTableCache
    ]);
    this.availableTablesSubject.next(Array.from(allTables.values()));
  }

  // Nettoyer toutes les ressources lors de la destruction de l'application
  destroy(): void {
    // Nettoyer tous les subjects
    this.destroySubjects.forEach(subject => {
      subject.next();
      subject.complete();
    });
    this.tableDataSubjects.forEach(subject => subject.complete());

    // Vider les maps
    this.registeredTables.clear();
    this.tableDataSubjects.clear();
    this.destroySubjects.clear();

    // Réinitialiser le subject principal
    this.availableTablesSubject.next([]);
  }

  // Attendre qu'une table soit prête
  waitForTable(cardId: number): Observable<boolean> {
    let subject = this.tableReadyStates.get(cardId);
    if (!subject) {
      subject = new BehaviorSubject<TableReadyState>({
        isSchemaReady: false,
        isDataReady: false
      });
      this.tableReadyStates.set(cardId, subject);
    }
    // Transformer l'Observable<TableReadyState> en Observable<boolean>
    return subject.asObservable().pipe(
      map(state => state.isSchemaReady && state.isDataReady)
    );
  }

  // Ajouter cette méthode pour obtenir l'état de préparation d'une table
  getTableReadyState$(cardId: number): Observable<TableReadyState> {
    let subject = this.tableReadyStates.get(cardId);
    if (!subject) {
      subject = new BehaviorSubject<TableReadyState>({
        isSchemaReady: false,
        isDataReady: false
      });
      this.tableReadyStates.set(cardId, subject);
    }
    return subject.asObservable();
  }

  // Ajouter une méthode utilitaire pour signaler une erreur
  private setTableError(cardId: number, error: string): void {
    const readyState = this.tableReadyStates.get(cardId);
    if (readyState) {
      readyState.next({
        ...readyState.value,
        error
      });
    }
  }
}
