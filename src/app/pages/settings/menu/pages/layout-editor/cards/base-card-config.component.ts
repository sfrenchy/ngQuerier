import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CardDto, BaseCardConfig } from '@models/api.models';

@Component({
  selector: 'app-base-card-config',
  templateUrl: './base-card-config.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule]
})
export class BaseCardConfigComponent<T extends BaseCardConfig = BaseCardConfig> {
  @Input() card!: CardDto<T>;
  @Input() form!: FormGroup;
  @Output() save = new EventEmitter<CardDto<T>>();
  @Output() cancel = new EventEmitter<void>();
} 