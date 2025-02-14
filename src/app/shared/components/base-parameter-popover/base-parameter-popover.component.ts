import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {StoredProcedureParameter} from '@models/parameters.models';

@Component({
  template: '',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule]
})
export abstract class BaseParameterPopover implements OnChanges {
  @Input() parameter!: StoredProcedureParameter;
  @Output() parameterChange = new EventEmitter<StoredProcedureParameter>();
  @Output() close = new EventEmitter<void>();

  localParameter?: StoredProcedureParameter;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['parameter']) {
      this.localParameter = {...this.parameter};
      this.onParameterChange();
    }
  }

  protected abstract onParameterChange(): void;

  protected onValueChange(): void {
    if (this.localParameter) {
      this.parameterChange.emit(this.localParameter);
    }
  }

  protected getCommonParameter(): StoredProcedureParameter {
    return {
      name: this.parameter.name,
      type: this.getParameterType(),
      value: null,
      userChangeAllowed: true,
      displayName: this.parameter.displayName,
      description: this.parameter.description
    };
  }

  protected abstract getParameterType(): string;
}
