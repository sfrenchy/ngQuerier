import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CardDto} from '@models/api.models';

@Component({
  selector: 'app-card-wrapper',
  templateUrl: './card-wrapper.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class CardWrapperComponent {
  @Input() card!: CardDto;
  @Input() isEditing = false;
  @Output() delete = new EventEmitter<void>();
  @Output() configure = new EventEmitter<void>();

  private _height: number = 0;
  @Input()
  set height(value: number) {
    this._height = value;
  }

  get height(): number {
    return this._height;
  }

  onDelete() {
    this.delete.emit();
  }

  onConfigure() {
    this.configure.emit();
  }
}
