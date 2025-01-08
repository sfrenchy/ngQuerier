import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DynamicRow } from '@models/page-layout.models';

@Component({
  selector: 'app-row-edit-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './row-edit-dialog.component.html'
})
export class RowEditDialogComponent {
  @Input() row!: DynamicRow;
  @Output() onSave = new EventEmitter<DynamicRow>();
  @Output() onCancel = new EventEmitter<void>();

  rowData!: DynamicRow;

  ngOnInit() {
    // Clone the input row to avoid modifying it directly
    this.rowData = { ...this.row };
  }
} 