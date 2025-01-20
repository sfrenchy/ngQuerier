import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardDto, BaseCardConfig } from '@models/api.models';
import { uintToHex } from '../shared/utils/color.utils';
import { CardDatabaseService } from '../services/card-database.service';

@Component({
  selector: 'app-base-card',
  templateUrl: './base-card.component.html',
  styleUrls: ['./base-card.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class BaseCardComponent<T extends BaseCardConfig = BaseCardConfig> implements OnDestroy {
  @Input() card!: CardDto;
  @Input() isEditing: boolean = false;
  @Input() showFullscreenButton: boolean = false;
  protected _height: number = 0;
  isFullscreen: boolean = false;

  @ViewChild('cardContainer') cardContainer!: ElementRef;

  @Input()
  set height(value: number) {
    if (this._height !== value) {
      this._height = value;
      this.onHeightChange();
    }
  }
  get height(): number {
    return this._height;
  }

  protected _isResizing = false;
  @Input() 
  get isResizing(): boolean {
    return this._isResizing;
  }
  set isResizing(value: boolean) {
    this._isResizing = value;
  }

  @Output() delete = new EventEmitter<void>();
  @Output() configure = new EventEmitter<void>();
  @Output() fullscreenChange = new EventEmitter<boolean>();

  constructor(protected cardDatabaseService?: CardDatabaseService) {}

  ngOnDestroy() {}

  protected onHeightChange() {
    if (this.isFullscreen) {
      this.fullscreenChange.emit(true);
    }
  }

  get backgroundColor(): string {
    return uintToHex(this.card.backgroundColor);
  }

  get textColor(): string {
    return uintToHex(this.card.textColor);
  }

  get headerTextColor(): string {
    return uintToHex(this.card.headerTextColor);
  }

  get headerBackgroundColor(): string {
    return uintToHex(this.card.headerBackgroundColor);
  }

  onConfigure() {
    this.configure.emit();
  }

  onDelete() {
    this.delete.emit();
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
    this.fullscreenChange.emit(this.isFullscreen);
  }
} 