import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutDto, RowDto, CardDto } from '@models/api.models';
import { DroppableRowComponent } from './rows/droppable-row.component';
import { BaseCardComponent } from '@cards/base-card.component';
import { BaseCardConfigurationComponent } from '@cards/base-card-configuration.component';
import { CardService } from '@cards/card.service';
import { CardMetadata } from '@cards/card.decorator';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import '@cards/available-cards';
import { CardRegistry } from '@cards/card.registry';
import { hexToUint } from '@shared/utils/color.utils';

interface CardMetadataWithSafeIcon extends CardMetadata {
  safeIcon: SafeHtml;
}

@Component({
  selector: 'app-layout-editor',
  templateUrl: './layout-editor.component.html',
  styleUrls: ['./layout-editor.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    DroppableRowComponent,
    BaseCardConfigurationComponent
  ]
})
export class LayoutEditorComponent implements OnInit, OnDestroy {
  @Input() set pageId(value: number | null) {
    if (value) {
      this._layout = {
        ...this._layout,
        pageId: value
      };
    }
  }

  private _layout: LayoutDto = {
    pageId: 0,
    rows: []
  };

  get layout(): LayoutDto {
    return this._layout;
  }

  set layout(value: LayoutDto) {
    

    // Désérialiser les configurations des cartes
    const updatedLayout = {
      ...value,
      rows: value.rows.map(row => ({
        ...row,
        cards: row.cards.map(card => {
          const deserializedCard = this.cardService.deserializeCardConfig(card);
          // Préserver les valeurs des couleurs
          return {
            ...deserializedCard,
            backgroundColor: card.backgroundColor,
            textColor: card.textColor,
            headerTextColor: card.headerTextColor,
            headerBackgroundColor: card.headerBackgroundColor
          };
        })
      }))
    };

    this._layout = updatedLayout;
  }

  isDraggingRow = false;
  isDraggingCard = false;
  private isDraggingRowItem = false;
  private isDraggingCardItem = false;

  nextRowId = 1;
  nextCardId = 1;
  resizing = false;
  private currentRowId: number | null = null;
  private startY = 0;
  private startHeight = 0;

  showCardConfig = false;
  configCardData: { rowId: number; cardId: number; } | null = null;
  isFullscreen = false;

  availableCards: CardMetadataWithSafeIcon[] = [];

  constructor(
    private cardService: CardService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.availableCards = this.cardService.getAvailableCards().map(card => ({
      ...card,
      safeIcon: this.sanitizer.bypassSecurityTrustHtml(card.icon)
    }));
  }

  ngOnDestroy(): void {
  }

  onDragStart(event: DragEvent, cardMetadata?: CardMetadata) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', cardMetadata ? 'card' : 'row');
      if (cardMetadata) {
        const cardType = cardMetadata.name.toLowerCase();
        event.dataTransfer.setData('cardType', cardType);
      }
      event.dataTransfer.effectAllowed = 'move';
      if (!cardMetadata) {
        this.isDraggingRowItem = true;
        this.isDraggingRow = true;
      } else {
        this.isDraggingCardItem = true;
        this.isDraggingCard = true;
      }
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
      if (this.isDraggingRowItem) {
        this.isDraggingRow = true;
      }
    }
  }

  onDragLeave(event: DragEvent) {
    if (event.currentTarget === event.target) {
      this.isDraggingRow = false;
      this.isDraggingCard = false;
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDraggingRow = false;
    this.isDraggingCard = false;
    this.isDraggingRowItem = false;
    this.isDraggingCardItem = false;
    
    if (!event.dataTransfer) return;

    const type = event.dataTransfer.getData('text/plain');
    if (type === 'row') {
      const newRow: RowDto = {
        id: this.nextRowId++,
        order: this.layout.rows.length,
        height: 200,
        cards: []
      };
      this.layout = {
        ...this.layout,
        rows: [...this.layout.rows, newRow]
      };
    }
  }

  onCardDrop(event: { rowId: number; cardType?: string }) {
    const rowIndex = this.layout.rows.findIndex(r => r.id === event.rowId);
    if (rowIndex === -1) return;

    // Calcul de l'espace disponible
    const row = this.layout.rows[rowIndex];
    const usedSpace = row.cards.reduce((total, card) => total + (card.gridWidth || 4), 0);
    const availableSpace = 12 - usedSpace;
    
    if (availableSpace <= 0) return; // Pas d'espace disponible

    const cardType = event.cardType || 'label';
    const metadata = CardRegistry.getMetadata(cardType);
    const configuration = metadata?.defaultConfig?.();

    const newCard: CardDto = {
      id: this.nextCardId++,
      type: cardType,
      title: [{ languageCode: 'fr', value: 'Nouvelle carte' }],
      order: row.cards.length,
      gridWidth: availableSpace,
      backgroundColor: hexToUint('#ffffff'),  // blanc
      textColor: hexToUint('#000000'),       // noir
      headerTextColor: hexToUint('#000000'), // noir
      headerBackgroundColor: hexToUint('#f3f4f6'), // gris clair
      rowId: event.rowId,
      configuration: configuration,
      displayHeader: true,
      displayFooter: false,
      icon: 'fa-solid fa-circle-plus'
    };

    const updatedRows = [...this.layout.rows];
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      cards: [...updatedRows[rowIndex].cards, newCard]
    };
    
    this.layout = {
      ...this.layout,
      rows: updatedRows
    };
  }

  deleteRow(rowId: number) {
    const index = this.layout.rows.findIndex(r => r.id === rowId);
    if (index !== -1) {
      this.layout = {
        ...this.layout,
        rows: this.layout.rows.filter(r => r.id !== rowId)
      };
    }
  }

  deleteCard(rowId: number, cardId: number) {
    const rowIndex = this.layout.rows.findIndex(r => r.id === rowId);
    if (rowIndex !== -1) {
      const updatedRows = [...this.layout.rows];
      updatedRows[rowIndex] = {
        ...updatedRows[rowIndex],
        cards: updatedRows[rowIndex].cards.filter(c => c.id !== cardId)
      };
      this.layout = {
        ...this.layout,
        rows: updatedRows
      };
    }
  }

  configureCard(rowId: number, cardId: number) {
    const row = this.layout.rows.find(r => r.id === rowId);
    if (!row) return;

    const card = row.cards.find(c => c.id === cardId);
    if (!card) return;

    this.configCardData = { rowId, cardId };
    this.showCardConfig = true;
  }

  onCardConfigSave(updatedCard: CardDto) {
    const data = this.configCardData;
    if (!data) return;

    const rowIndex = this.layout.rows.findIndex(r => r.id === data.rowId);
    if (rowIndex === -1) return;

    const updatedRows = [...this.layout.rows];
    const cardIndex = updatedRows[rowIndex].cards.findIndex(c => c.id === data.cardId);
    if (cardIndex === -1) return;

    // S'assurer que la configuration est correctement sérialisée
    const cardWithSerializedConfig = {
      ...updatedCard,
      configuration: updatedCard.configuration?.toJson()
    };

    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      cards: [
        ...updatedRows[rowIndex].cards.slice(0, cardIndex),
        cardWithSerializedConfig,
        ...updatedRows[rowIndex].cards.slice(cardIndex + 1)
      ]
    };

    this.layout = {
      ...this.layout,
      rows: updatedRows
    };

    this.closeCardConfig();
  }

  closeCardConfig() {
    this.showCardConfig = false;
    this.configCardData = null;
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
  }

  startResize(event: { event: MouseEvent, rowId: number }) {
    // Ne rien faire ici, le DroppableRowComponent gère le redimensionnement
  }

  endResize(event: { rowId: number, newHeight: number }) {
    const rowIndex = this.layout.rows.findIndex(r => r.id === event.rowId);
    if (rowIndex !== -1) {
      const updatedRows = [...this.layout.rows];
      updatedRows[rowIndex] = {
        ...updatedRows[rowIndex],
        height: event.newHeight
      };
      this.layout = {
        ...this.layout,
        rows: updatedRows
      };
    }
  }

  getCardToEdit(): CardDto | null {
    if (!this.configCardData) return null;
    return this.layout.rows
      .find(r => r.id === this.configCardData?.rowId)
      ?.cards.find(c => c.id === this.configCardData?.cardId) || null;
  }

  getRowForCard(): RowDto | null {
    if (!this.configCardData) return null;
    return this.layout.rows.find(r => r.id === this.configCardData?.rowId) || null;
  }
}
