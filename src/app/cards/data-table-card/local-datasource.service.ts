import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { RegisteredDataTable, TableDataEvent } from './data-table-card.models';

@Injectable({
  providedIn: 'root'
})
export class LocalDataSourceService {
  private registeredTables = new Map<number, RegisteredDataTable>();
  private availableTablesSubject = new BehaviorSubject<RegisteredDataTable[]>([]);
  private tableDataSubjects = new Map<number, BehaviorSubject<TableDataEvent | null>>();
  private destroySubjects = new Map<number, Subject<void>>();

  constructor() {}

  // Enregistrer une nouvelle table comme source de données
  registerDataTable(table: RegisteredDataTable): void {
    // Créer un nouveau subject pour les données de cette table
    const dataSubject = new BehaviorSubject<TableDataEvent | null>(null);
    const destroySubject = new Subject<void>();

    // S'abonner aux données de la table
    table.currentData$
      .pipe(takeUntil(destroySubject))
      .subscribe(data => dataSubject.next(data));

    // Stocker les références
    this.registeredTables.set(table.cardId, table);
    this.tableDataSubjects.set(table.cardId, dataSubject);
    this.destroySubjects.set(table.cardId, destroySubject);

    this.updateAvailableTables();
  }

  // Désenregistrer une table
  unregisterDataTable(cardId: number): void {
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
      map(tables => tables.filter(table => table.cardId !== excludeCardId))
    );
  }

  // Obtenir une table spécifique
  getDataTable(cardId: number): RegisteredDataTable | undefined {
    return this.registeredTables.get(cardId);
  }

  // Obtenir le flux de données d'une table spécifique
  getTableData(cardId: number): Observable<TableDataEvent | null> | undefined {
    const subject = this.tableDataSubjects.get(cardId);
    return subject?.asObservable();
  }

  // Obtenir le schéma d'une table spécifique
  getTableSchema(cardId: number): any | undefined {
    return this.registeredTables.get(cardId)?.schema;
  }

  // Vérifier si une table est disponible
  isTableAvailable(cardId: number): boolean {
    return this.registeredTables.has(cardId);
  }

  private updateAvailableTables(): void {
    this.availableTablesSubject.next(Array.from(this.registeredTables.values()));
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
}
