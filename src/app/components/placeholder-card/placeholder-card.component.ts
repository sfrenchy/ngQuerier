import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { BaseCardComponent } from '@components/base-card/base-card.component';
import { CardHeaderComponent } from '@components/card-header/card-header.component';

@Component({
  selector: 'app-placeholder-card',
  standalone: true,
  imports: [CommonModule, TranslateModule, CardHeaderComponent],
  template: `
    <div class="flex flex-col h-full min-h-full"
         [style.background-color]="card.configuration['backgroundColor']"
         [style.color]="card.configuration['textColor']">
      <app-card-header *ngIf="buildHeader()"
                      [title]="getLocalizedTitle('fr')"
                      [backgroundColor]="card.configuration['headerBackgroundColor']"
                      [textColor]="card.configuration['headerTextColor']"
                      (edit)="onEdit.emit()"
                      (delete)="onDelete.emit()">
        <ng-content dragHandle select="[dragHandle]"></ng-content>
      </app-card-header>

      <div class="flex-1 p-4 flex items-center justify-center min-h-0">
        {{ buildCardContent() }}
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 100%;
    }
  `]
})
export class PlaceholderCardComponent extends BaseCardComponent {
  @Input() override isEditing: boolean = false;
  @Input() override maxRowHeight: number = 0;
  @Output() override onEdit = new EventEmitter<void>();
  @Output() override onDelete = new EventEmitter<void>();

  override buildHeader(): boolean {
    return this.card.configuration['showHeader'] ?? true;
  }

  override buildCardContent(): string {
    const centerLabel = this.card.configuration['centerLabel'] as { [key: string]: string };
    return centerLabel['fr'] || centerLabel['en'] || '';
  }
} 