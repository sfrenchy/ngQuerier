import { Component, EventEmitter, Input, OnInit, Output, Type, ViewChild, ViewContainerRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardDto, RowDto } from '@models/api.models';
import { TranslatableStringFormComponent } from '@shared/components/translatable-string-form/translatable-string-form.component';
import { TileComponent } from '@shared/components/tile/tile.component';
import { CardRegistry } from './card.registry';

@Component({
  selector: 'app-base-card-configuration',
  templateUrl: './base-card-configuration.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatableStringFormComponent,
    TileComponent
  ]
})
export class BaseCardConfigurationComponent implements OnInit, AfterViewInit {
  @Input() card!: CardDto;
  @Input() row!: RowDto;
  @Input() isFullscreen = false;
  @Output() save = new EventEmitter<CardDto>();
  @Output() cancel = new EventEmitter<void>();
  @Output() toggleFullscreen = new EventEmitter<void>();
  @ViewChild('configContainer', { read: ViewContainerRef }) configContainer!: ViewContainerRef;

  form: FormGroup;
  maxAvailableWidth: number = 12;
  cardConfigComponent?: Type<any>;

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

    const metadata = CardRegistry.getMetadata(this.card.type);
    if (metadata) {
      this.cardConfigComponent = metadata.configComponent;
    }
  }

  ngAfterViewInit() {
    if (this.cardConfigComponent && this.configContainer) {
      // Créer le composant de configuration
      const componentRef = this.configContainer.createComponent(this.cardConfigComponent);
      
      // Définir les inputs
      componentRef.setInput('card', this.card);
      
      // S'abonner aux outputs
      componentRef.instance.save?.subscribe((configuration: any) => {
        this.onCardConfigSave(configuration);
      });

      // S'abonner aux changements en temps réel
      componentRef.instance.configChange?.subscribe((configuration: any) => {
        this.card = {
          ...this.card,
          configuration
        };
      });
    }
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
      const { configuration, ...rest } = this.card;
      const updatedCard: CardDto = {
        ...rest,
        ...this.form.value,
        configuration: this.card.configuration
      };
      this.save.emit(updatedCard);
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  onCardConfigSave(configuration: any) {
    const { configuration: oldConfig, ...rest } = this.card;
    const updatedCard: CardDto = {
      ...rest,
      configuration
    };
    this.save.emit(updatedCard);
  }
} 