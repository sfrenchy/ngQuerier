import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

export interface ConfirmationDialogData {
  titleKey?: string;
  messageKey: string;
  messageParams?: { [key: string]: string | number | undefined };
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './confirmation-dialog.component.html'
})
export class ConfirmationDialogComponent {
  @Input() titleKey?: string;
  @Input() messageKey!: string;
  @Input() messageParams?: { [key: string]: string | number | undefined };

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
