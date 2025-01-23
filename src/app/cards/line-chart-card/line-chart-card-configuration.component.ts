import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LineChartCardConfig } from './line-chart-card.component';
import { CardDto } from '@models/api.models';
import { TileComponent } from '@shared/components/tile/tile.component';
import { IconSelectorComponent } from '@shared/components/icon-selector/icon-selector.component';
import { TranslatableStringFormComponent } from '@shared/components/translatable-string-form/translatable-string-form.component';

@Component({
  selector: 'app-line-chart-card-configuration',
  templateUrl: './line-chart-card-configuration.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    TileComponent,
    IconSelectorComponent,
    TranslatableStringFormComponent
  ]
})
export class LineChartCardConfigurationComponent implements OnInit {
  @Input() card!: CardDto<LineChartCardConfig>;
  @Output() save = new EventEmitter<LineChartCardConfig>();
  @Output() configChange = new EventEmitter<LineChartCardConfig>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      title: [null, Validators.required],
      icon: [null, Validators.required],
      gridWidth: [50, Validators.required],
      backgroundColor: ['#111827', Validators.required],
      textColor: ['#ffffff', Validators.required]
    });

    // Emit changes when form changes
    this.form.valueChanges.subscribe((value: any) => {
      if (this.form.valid) {
        const config = new LineChartCardConfig(
          // Add constructor parameters here
        );
        this.configChange.emit(config);
      }
    });
  }

  ngOnInit() {
    if (this.card.configuration) {
      this.form.patchValue({
        title: this.card.title,
        icon: this.card.icon,
        gridWidth: this.card.gridWidth,
        backgroundColor: this.card.backgroundColor,
        textColor: this.card.textColor
      }, { emitEvent: false }); // Don't emit during initialization
    }
  }

  // Method for final save
  onSave() {
    if (this.form.valid) {
      const config = new LineChartCardConfig(
        // Add constructor parameters here
      );
      this.save.emit(config);
    }
  }
} 