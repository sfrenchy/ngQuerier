import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { StoredProcedureParameter } from '@models/parameters.models';
import { ParameterPopoverComponent } from '../parameter-popover/parameter-popover.component';

@Component({
  selector: 'app-chart-parameters-footer',
  templateUrl: './chart-parameters-footer.component.html',
  standalone: true,
  imports: [CommonModule, TranslateModule, ParameterPopoverComponent]
})
export class ChartParametersFooterComponent implements OnChanges {
  @Input() parameters: StoredProcedureParameter[] = [];
  @Input() lastUpdate?: Date;
  @Input() autoRefreshInterval?: number;
  @Output() parameterChange = new EventEmitter<StoredProcedureParameter[]>();

  selectedParameter?: StoredProcedureParameter;
  private lastClickedButton?: HTMLElement;

  constructor(private elementRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log('[ChartParametersFooter] Changes detected:', changes);
    if (changes['parameters']) {
      console.log('[ChartParametersFooter] Parameters updated:', this.parameters);
    }
  }

  get activeParameters(): StoredProcedureParameter[] {
    console.log('[ChartParametersFooter] Active parameters:', this.parameters);
    return this.parameters.filter(p => p.userChangeAllowed);
  }

  openPopover(parameter: StoredProcedureParameter, event: MouseEvent): void {
    console.log('[ChartParametersFooter] Opening popover with parameter:', parameter);
    this.selectedParameter = parameter;
    this.lastClickedButton = event.currentTarget as HTMLElement;
  }

  closePopover(): void {
    console.log('[ChartParametersFooter] Closing popover');
    this.selectedParameter = undefined;
    this.lastClickedButton = undefined;
  }

  onParameterChange(updatedParameter: StoredProcedureParameter): void {
    console.log('[ChartParametersFooter] Parameter changed:', updatedParameter);
    const updatedParameters = this.parameters.map(p => 
      p.name === updatedParameter.name ? updatedParameter : p
    );
    console.log('[ChartParametersFooter] Emitting updated parameters:', updatedParameters);
    this.parameterChange.emit(updatedParameters);
  }

  formatValue(parameter: StoredProcedureParameter): string {
    if (parameter.type === 'date') {
      if (parameter.dateType && parameter.dateType !== 'specific') {
        return parameter.dateType;
      }
      return parameter.value ? new Date(parameter.value).toLocaleDateString() : '';
    }
    if (parameter.type === 'boolean') {
      return parameter.value ? '✓' : '✗';
    }
    return parameter.value?.toString() || '';
  }

  getPopoverPosition() {
    if (!this.lastClickedButton) return null;
    const rect = this.lastClickedButton.getBoundingClientRect();
    return {
      top: rect.top - window.scrollY,
      left: rect.left - window.scrollX - 125 // Centrer le popover (250px/2)
    };
  }
} 