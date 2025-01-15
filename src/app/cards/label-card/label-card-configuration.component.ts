import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LabelCardConfig } from './label-card.component';
import { CardDto } from '@models/api.models';

@Component({
  selector: 'app-label-card-configuration',
  templateUrl: './label-card-configuration.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class LabelCardConfigurationComponent implements OnInit {
  @Input() card!: CardDto<LabelCardConfig>;
  @Output() save = new EventEmitter<LabelCardConfig>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      label: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.card.configuration) {
      this.form.patchValue({
        label: this.card.configuration.label
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const config = new LabelCardConfig(this.form.value.label);
      this.save.emit(config);
    }
  }
} 