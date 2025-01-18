import { Component, EventEmitter, Input, Output, NgModuleRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { CardDto, RowDto } from '@models/api.models';
import { CardService } from '@cards/card.service';
import { CardWrapperComponent } from '@cards/card-wrapper/card-wrapper.component';

@Component({
  selector: 'app-droppable-row',
  templateUrl: './droppable-row.component.html',
  standalone: true,
  imports: [CommonModule, NgComponentOutlet, CardWrapperComponent]
})
export class DroppableRowComponent implements OnInit, OnChanges {
  @Input() row!: RowDto;
  @Input() set height(value: number) {
    if (!this.isResizing) {
      this._height = value;
    }
  }
  get height(): number {
    return this._height;
  }

  private _height: number = 0;

  @Output() deleteRow = new EventEmitter<void>();
  @Output() startResize = new EventEmitter<{event: MouseEvent, rowId: number}>();
  @Output() endResize = new EventEmitter<{rowId: number, newHeight: number}>();
  @Output() cardDrop = new EventEmitter<{rowId: number, cardType?: string}>();
  @Output() deleteCard = new EventEmitter<{rowId: number, cardId: number}>();
  @Output() configureCard = new EventEmitter<{rowId: number, cardId: number}>();
  @Output() configureRow = new EventEmitter<number>();

  isDraggingCard = false;
  isResizing = false;
  resizeGhost: HTMLElement | null = null;
  initialHeight: number = 0;
  initialY: number = 0;
  currentHeight: number = 0;
  targetHeight: number = 0;

  private cardComponents = new Map<string, any>();

  constructor(
    private cardService: CardService,
    public moduleRef: NgModuleRef<any>
  ) {}

  ngOnInit() {
    this._height = this.row.height;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['row'] && !this.isResizing) {
      this._height = this.row.height;
    }
  }

  get rowHeight(): number {
    return this.isResizing ? this.currentHeight : this.targetHeight;
  }

  getCardComponent(card: any) {
    const type = card.type;
    if (!this.cardComponents.has(type)) {
      const component = this.cardService.getCardByType(type);
      this.cardComponents.set(type, {
        component,
        inputs: {
          card: card,
          isEditing: true
        }
      });
    } else {
      // Mettre à jour les inputs si la carte a changé
      const cardComponent = this.cardComponents.get(type);
      cardComponent.inputs = {
        card: card,
        isEditing: true
      };
    }
    return this.cardComponents.get(type);
  }

  onDeleteRow() {
    this.deleteRow.emit();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDragEnter(event: DragEvent) {
    event.preventDefault();
    const type = event.dataTransfer?.getData('text/plain');
    if (type === 'card') {
      this.isDraggingCard = true;
    }
  }

  onDragLeave(event: DragEvent) {
    if (event.currentTarget === event.target) {
      this.isDraggingCard = false;
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDraggingCard = false;
    
    if (!event.dataTransfer) return;

    const type = event.dataTransfer.getData('text/plain');
    if (type === 'card') {
      const cardType = event.dataTransfer.getData('cardType');
      this.cardDrop.emit({
        rowId: this.row.id,
        cardType
      });
    }
  }

  onResizeStart(event: MouseEvent) {
    event.preventDefault();
    this.isResizing = true;
    const rowElement = (event.target as HTMLElement).closest('.row') as HTMLElement;
    if (!rowElement) return;

    // Créer le fantôme
    this.resizeGhost = document.createElement('div');
    this.resizeGhost.className = 'resize-ghost';
    this.resizeGhost.style.position = 'fixed';
    this.resizeGhost.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
    this.resizeGhost.style.border = '2px dashed rgb(59, 130, 246)';
    this.resizeGhost.style.pointerEvents = 'none';
    this.resizeGhost.style.zIndex = '9999';

    // Positionner le fantôme
    const rect = rowElement.getBoundingClientRect();
    this.initialHeight = rect.height;
    this.initialY = event.clientY;
    
    // Utiliser les coordonnées viewport pour le positionnement fixed
    this.resizeGhost.style.top = `${rect.top}px`;
    this.resizeGhost.style.left = `${rect.left}px`;
    this.resizeGhost.style.width = `${rect.width}px`;
    this.resizeGhost.style.height = `${rect.height}px`;
    
    // Ajouter au body avec un style plus visible
    this.resizeGhost.style.opacity = '1';
    document.body.appendChild(this.resizeGhost);

    // Ajouter les écouteurs pour le redimensionnement
    document.addEventListener('mousemove', this.onResizeMove);
    document.addEventListener('mouseup', this.onResizeEnd);

    // Émettre l'événement de début de redimensionnement
    this.startResize.emit({
      event,
      rowId: this.row.id
    });
  }

  private onResizeMove = (event: MouseEvent) => {
    if (!this.resizeGhost) return;
    event.preventDefault();

    const deltaY = event.clientY - this.initialY;
    const newHeight = Math.max(100, this.initialHeight + deltaY);
    this.resizeGhost.style.height = `${newHeight}px`;
  }

  private onResizeEnd = (event: MouseEvent) => {
    if (!this.resizeGhost) return;
    event.preventDefault();

    // Calculer la hauteur finale
    const deltaY = event.clientY - this.initialY;
    const newHeight = Math.round(Math.max(100, this.initialHeight + deltaY));

    // Nettoyer
    document.removeEventListener('mousemove', this.onResizeMove);
    document.removeEventListener('mouseup', this.onResizeEnd);
    this.resizeGhost.remove();
    this.resizeGhost = null;
    this.isResizing = false;

    // Émettre un événement avec la nouvelle hauteur
    this.endResize.emit({
      rowId: this.row.id,
      newHeight: newHeight
    });
  }

  onCardDelete(cardId: number) {
    this.deleteCard.emit({
      rowId: this.row.id,
      cardId
    });
  }

  onCardConfigure(cardId: number) {
    this.configureCard.emit({
      rowId: this.row.id,
      cardId
    });
  }

  onConfigureRow() {
    this.configureRow.emit(this.row.id);
  }

  ngOnDestroy() {
    // Nettoyer les écouteurs si nécessaire
    if (this.isResizing) {
      document.removeEventListener('mousemove', this.onResizeMove);
      document.removeEventListener('mouseup', this.onResizeEnd);
      if (this.resizeGhost) {
        this.resizeGhost.remove();
      }
    }
  }
} 