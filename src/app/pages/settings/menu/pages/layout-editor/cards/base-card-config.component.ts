import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BaseCardConfig, CardDto } from '@models/api.models';

@Component({
  selector: 'app-base-card-config',
  templateUrl: './base-card-config.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class BaseCardConfigComponent<T extends BaseCardConfig = BaseCardConfig> {
  @Input() form!: FormGroup;
  @Input() card!: CardDto<T>;
  @Output() save = new EventEmitter<CardDto<T>>();
  @Output() cancel = new EventEmitter<void>();
} 