import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { StoredProcedureParameter } from '@models/parameters.models';

@Component({
  selector: 'app-parameter-popover',
  templateUrl: './parameter-popover.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule]
})
export class ParameterPopoverComponent implements OnChanges {
  @Input() parameter!: StoredProcedureParameter;
  @Output() parameterChange = new EventEmitter<StoredProcedureParameter>();
  @Output() close = new EventEmitter<void>();

  localParameter?: StoredProcedureParameter;

  ngOnChanges(changes: SimpleChanges): void {
    console.log('[ParameterPopover] Changes detected:', changes);
    if (changes['parameter']) {
      console.log('[ParameterPopover] Parameter updated:', this.parameter);
      this.localParameter = { ...this.parameter };
      if (this.localParameter.type === 'date' && this.localParameter.value) {
        const [datePart] = this.localParameter.value.split('T');
        this.localParameter.value = datePart;
        console.log('[ParameterPopover] Formatted date value:', this.localParameter.value);
      }
    }
  }

  onValueChange(): void {
    if (this.localParameter) {
      if (this.localParameter.type === 'date' && this.localParameter.value) {
        this.localParameter.value = `${this.localParameter.value}T00:00`;
      }
      console.log('[ParameterPopover] Value changed, emitting:', this.localParameter);
      this.parameterChange.emit(this.localParameter);
    }
  }
} 