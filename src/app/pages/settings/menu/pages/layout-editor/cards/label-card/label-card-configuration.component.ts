import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardDto } from '@models/api.models';
import { LabelCardDto } from './label-card.component';
import { TileComponent } from '@shared/components/tile/tile.component';

@Component({
  selector: 'app-label-card-configuration',
  templateUrl: './label-card-configuration.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TileComponent
  ]
})
export class LabelCardConfigurationComponent implements OnInit {
  @Input() card!: CardDto;
  @Input() config?: LabelCardDto;
  @Input() isFullscreen = false;
  @Output() save = new EventEmitter<LabelCardDto>();
  @Output() cancel = new EventEmitter<void>();
  @Output() toggleFullscreen = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      label: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.config) {
      this.form.patchValue(this.config);
    }
  }

  onSave() {
    if (this.form.valid) {
      this.save.emit(this.form.value);
    }
  }

  onCancel() {
    this.cancel.emit();
  }
} 