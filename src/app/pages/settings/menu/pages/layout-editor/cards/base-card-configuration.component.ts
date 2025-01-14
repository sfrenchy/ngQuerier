import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardDto, RowDto, TranslatableString } from '@models/api.models';
import { TranslatableStringFormComponent } from '@shared/components/translatable-string-form/translatable-string-form.component';
import { TileComponent } from '@shared/components/tile/tile.component';

@Component({
  selector: 'app-base-card-configuration',
  templateUrl: './base-card-configuration.component.html',
  styleUrls: ['./base-card-configuration.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatableStringFormComponent,
    TileComponent
  ]
})
export class BaseCardConfigurationComponent implements OnInit {
  @Input() card!: CardDto;
  @Input() row!: RowDto;
  @Input() isFullscreen = false;
  @Output() save = new EventEmitter<CardDto>();
  @Output() cancel = new EventEmitter<void>();
  @Output() toggleFullscreen = new EventEmitter<void>();

  form: FormGroup;
  maxAvailableWidth: number = 12;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      title: [[]],
      gridWidth: [4, [Validators.required, Validators.min(1)]],
      backgroundColor: ['#ffffff'],
      textColor: ['#000000'],
      headerTextColor: ['#000000'],
      headerBackgroundColor: ['#f3f4f6']
    });
  }

  ngOnInit() {
    this.calculateMaxWidth();
    this.form.patchValue({
      title: this.card.title,
      gridWidth: this.card.gridWidth,
      backgroundColor: this.card.backgroundColor,
      textColor: this.card.textColor,
      headerTextColor: this.card.headerTextColor,
      headerBackgroundColor: this.card.headerBackgroundColor
    });

    // Mettre à jour la validation de gridWidth avec la nouvelle valeur max
    this.form.get('gridWidth')?.setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(this.maxAvailableWidth)
    ]);
  }

  private calculateMaxWidth() {
    // Calculer l'espace utilisé par les autres cartes
    const usedSpace = this.row.cards
      .filter(c => c.id !== this.card.id) // Exclure la carte en cours d'édition
      .reduce((total, card) => total + (card.gridWidth || 4), 0);
    
    // La largeur maximale est simplement l'espace disponible dans la ligne
    this.maxAvailableWidth = 12 - usedSpace;
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