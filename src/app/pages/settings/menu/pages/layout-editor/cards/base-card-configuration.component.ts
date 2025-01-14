import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardDto, TranslatableString } from '@models/api.models';
import { TranslatableStringFormComponent } from '@shared/components/translatable-string-form/translatable-string-form.component';

@Component({
  selector: 'app-base-card-configuration',
  templateUrl: './base-card-configuration.component.html',
  styleUrls: ['./base-card-configuration.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatableStringFormComponent
  ]
})
export class BaseCardConfigurationComponent implements OnInit {
  @Input() card!: CardDto;
  @Input() isFullscreen = false;
  @Output() save = new EventEmitter<CardDto>();
  @Output() cancel = new EventEmitter<void>();
  @Output() toggleFullscreen = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      title: [[]],
      gridWidth: [4, [Validators.required, Validators.min(1), Validators.max(12)]],
      backgroundColor: ['#ffffff'],
      textColor: ['#000000'],
      headerTextColor: ['#000000'],
      headerBackgroundColor: ['#f3f4f6']
    });
  }

  ngOnInit() {
    this.form.patchValue({
      title: this.card.title,
      gridWidth: this.card.gridWidth,
      backgroundColor: this.card.backgroundColor,
      textColor: this.card.textColor,
      headerTextColor: this.card.headerTextColor,
      headerBackgroundColor: this.card.headerBackgroundColor
    });
  }

  onSave() {
    if (this.form.valid) {
      const updatedCard: CardDto = {
        ...this.card,
        ...this.form.value
      };
      this.save.emit(updatedCard);
    }
  }

  onCancel() {
    this.cancel.emit();
  }
} 