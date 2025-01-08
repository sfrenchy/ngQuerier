import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DynamicRow, DynamicCard, PageLayout } from '../models/page-layout.models';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PageLayoutService {
  private pageLayoutSubject = new BehaviorSubject<PageLayout | null>(null);
  pageLayout$ = this.pageLayoutSubject.asObservable();

  constructor(private apiService: ApiService) {}

  loadPageLayout(pageId: number): void {
    // TODO: Replace with actual API call
    const mockLayout: PageLayout = {
      pageId,
      icon: 'fas fa-columns',
      names: {},
      isVisible: true,
      roles: [],
      route: '',
      rows: [],
      isDirty: false
    };
    console.log('Initial layout loaded:', JSON.stringify(mockLayout, null, 2));
    this.pageLayoutSubject.next(mockLayout);
  }

  addRow(pageId: number, height: number = 500): void {
    const currentLayout = this.pageLayoutSubject.value;
    if (!currentLayout) return;

    const newRow: DynamicRow = {
      id: Date.now(),
      order: currentLayout.rows.length,
      height,
      cards: []
    };

    const updatedLayout: PageLayout = {
      ...currentLayout,
      rows: [...currentLayout.rows, newRow],
      isDirty: true
    };

    console.log('Adding row:', JSON.stringify(newRow, null, 2));
    console.log('Updated layout:', JSON.stringify(updatedLayout, null, 2));
    this.pageLayoutSubject.next(updatedLayout);
  }

  updateRows(pageId: number, rows: DynamicRow[]): void {
    console.log('Updating rows:', JSON.stringify(rows, null, 2));
    const currentLayout = this.pageLayoutSubject.value;
    if (!currentLayout) {
      console.warn('No current layout found');
      return;
    }

    const updatedLayout: PageLayout = {
      ...currentLayout,
      rows: rows,
      isDirty: true
    };

    console.log('Service - Updated layout:', JSON.stringify(updatedLayout, null, 2));
    this.pageLayoutSubject.next(updatedLayout);

    // Verify the update
    setTimeout(() => {
      console.log('Current state after update:', JSON.stringify(this.pageLayoutSubject.value, null, 2));
    }, 0);
  }

  addCardToRow(rowId: number, card: DynamicCard): void {
    const currentLayout = this.pageLayoutSubject.value;
    if (!currentLayout) return;

    const updatedRows = currentLayout.rows.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          cards: [...row.cards, { ...card, id: Date.now() }]
        };
      }
      return row;
    });

    this.pageLayoutSubject.next({
      ...currentLayout,
      rows: updatedRows,
      isDirty: true
    });
  }

  reorderRows(pageId: number, rowIds: number[]): void {
    const currentLayout = this.pageLayoutSubject.value;
    if (!currentLayout) return;

    const reorderedRows = rowIds.map((id, index) => {
      const row = currentLayout.rows.find(r => r.id === id);
      if (!row) throw new Error(`Row with id ${id} not found`);
      return { ...row, order: index };
    });

    this.pageLayoutSubject.next({
      ...currentLayout,
      rows: reorderedRows,
      isDirty: true
    });
  }

  saveLayout(pageId: number): void {
    // TODO: Implement API call to save layout
    const currentLayout = this.pageLayoutSubject.value;
    if (!currentLayout) return;

    this.pageLayoutSubject.next({
      ...currentLayout,
      isDirty: false
    });
  }
} 