import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseCardConfig, CardDto } from '@models/api.models';

@Component({
  selector: 'app-base-card-config',
  templateUrl: './base-card-config.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export abstract class BaseCardConfigComponent<T extends BaseCardConfig = BaseCardConfig> implements OnInit {
  @Input() card!: CardDto<T>;
  @Output() save = new EventEmitter<CardDto<T>>();
  @Output() cancel = new EventEmitter<void>();

  protected form!: FormGroup;

  constructor(protected fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      title: [this.card.title, Validators.required],
      gridWidth: [this.card.gridWidth, [Validators.required, Validators.min(1), Validators.max(12)]],
      backgroundColor: [this.card.backgroundColor || '#ffffff', Validators.required],
      ...this.getSpecificControls()
    });
  }

  abstract getSpecificControls(): { [key: string]: any[] };

  onSave(): void {
    if (this.form.valid) {
      const updatedCard: CardDto<T> = {
        ...this.card,
        ...this.form.value
      };
      this.save.emit(updatedCard);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
} 