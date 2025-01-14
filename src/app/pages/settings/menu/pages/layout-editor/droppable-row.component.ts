import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { RowDto, CardDto } from '@models/api.models';
import { BaseCardComponent } from './cards/base-card.component';
import { Type } from '@angular/core';

@Component({
  selector: 'app-droppable-row',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <div class="relative bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-500 transition-colors" 
         [style.height.px]="row.height"
         cdkDrag
         [cdkDragData]="row">
      <div class="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg opacity-50 h-full" *cdkDragPlaceholder></div>
      
      <div class="flex items-center p-2 bg-gray-50 border-b border-gray-200 rounded-t-lg">
        <span class="flex items-center cursor-move mr-2 text-gray-600" cdkDragHandle>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 7a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 13a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
          </svg>
        </span>
        <span class="flex-1 text-gray-700">
          Ligne {{row.order}} ({{row.height}}px)
        </span>
        <button class="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors" (click)="deleteRow.emit(row.id)">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>

      <!-- Grid des cartes -->
      <div cdkDropListGroup>
        <div class="grid grid-cols-12 gap-4 p-4 hover:bg-blue-50 transition-colors"
             cdkDropList
             #cardList="cdkDropList"
             [cdkDropListData]="row.cards"
             (cdkDropListDropped)="onCardDrop($event)"
             [cdkDropListConnectedTo]="[cardToolbox]">
          <ng-container *ngFor="let card of row.cards">
            <ng-container *ngComponentOutlet="
              getCardComponent(card.type);
              inputs: {
                card: card,
                configure: onConfigureCard.bind(this),
                delete: onDeleteCard.bind(this, row.id)
              }">
            </ng-container>
          </ng-container>
        </div>
      </div>
      
      <!-- Zone redimensionnable -->
      <div class="absolute bottom-0 left-0 right-0 h-6 bg-gray-100 border-t border-gray-300 cursor-row-resize hover:bg-gray-200 transition-colors group" 
           (mousedown)="startResize.emit({event: $event, rowId: row.id})">
        <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5">
          <div class="w-8 h-0.5 bg-gray-400 group-hover:bg-gray-500 transition-colors"></div>
          <div class="w-8 h-0.5 bg-gray-400 group-hover:bg-gray-500 transition-colors"></div>
        </div>
      </div>
    </div>
  `
})
export class DroppableRowComponent {
  @Input() row!: RowDto;
  @Input() cardToolbox!: CdkDropList;
  @Input() getCardComponent!: (type: string) => Type<BaseCardComponent> | null;

  @Output() deleteRow = new EventEmitter<number>();
  @Output() startResize = new EventEmitter<{event: MouseEvent, rowId: number}>();
  @Output() cardDropped = new EventEmitter<{event: CdkDragDrop<CardDto[]>, row: RowDto}>();
  @Output() configureCard = new EventEmitter<CardDto>();
  @Output() deleteCard = new EventEmitter<{rowId: number, card: CardDto}>();

  onCardDrop(event: CdkDragDrop<CardDto[]>) {
    this.cardDropped.emit({event, row: this.row});
  }

  onConfigureCard(card: CardDto) {
    this.configureCard.emit(card);
  }

  onDeleteCard(rowId: number, card: CardDto) {
    this.deleteCard.emit({rowId, card});
  }
} 