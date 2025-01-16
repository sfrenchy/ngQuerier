import { Component, EventEmitter, Input, OnInit, Output, Type, ViewChild, ViewContainerRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardDto, RowDto } from '@models/api.models';
import { TranslatableStringFormComponent } from '@shared/components/translatable-string-form/translatable-string-form.component';
import { TileComponent } from '@shared/components/tile/tile.component';
import { CardRegistry } from './card.registry';
import { hexToUint, uintToHex } from '../shared/utils/color.utils';
import { IconSelectorComponent } from '@shared/components/icon-selector/icon-selector.component';

@Component({
  selector: 'app-base-card-configuration',
  templateUrl: './base-card-configuration.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatableStringFormComponent,
    TileComponent,
    IconSelectorComponent
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

  form!: FormGroup;
  maxAvailableWidth: number = 12;
  cardConfigComponent?: Type<any>;
  private colorFields = ['backgroundColor', 'textColor', 'headerTextColor', 'headerBackgroundColor'];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      title: [this.card.title],
      icon: [this.card.icon],
      displayHeader: [this.card.displayHeader],
      displayFooter: [this.card.displayFooter],
      gridWidth: [this.card.gridWidth, [Validators.required, Validators.min(1)]],
      backgroundColor: [this.convertUintToHex(this.card.backgroundColor)],
      textColor: [this.convertUintToHex(this.card.textColor)],
      headerTextColor: [this.convertUintToHex(this.card.headerTextColor)],
      headerBackgroundColor: [this.convertUintToHex(this.card.headerBackgroundColor)]
    });

    this.calculateMaxWidth();

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

  private convertUintToHex(value: number): string {
    const hex = uintToHex(value);
    return hex;
  }

  private convertHexToUint(value: string): number {
    const uint = hexToUint(value);
    return uint;
  }

  onColorTextInput(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    let value = input.value.trim();
    
    // Add # if missing
    if (value && !value.startsWith('#')) {
      value = '#' + value;
    }
    
    // Validate hex format
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      this.form.patchValue({ [controlName]: value }, { emitEvent: false });
    }
  }

  onSave() {
    if (this.form.valid) {
      const formValues = this.form.value;

      // Séparer les propriétés de base de la configuration spécifique
      const baseProperties = {
        title: formValues.title,
        icon: formValues.icon,
        displayHeader: formValues.displayHeader,
        displayFooter: formValues.displayFooter,
        gridWidth: formValues.gridWidth,
        backgroundColor: this.convertHexToUint(formValues.backgroundColor),
        textColor: this.convertHexToUint(formValues.textColor),
        headerTextColor: this.convertHexToUint(formValues.headerTextColor),
        headerBackgroundColor: this.convertHexToUint(formValues.headerBackgroundColor)
      };

      const updatedCard: CardDto = {
        ...this.card,
        ...baseProperties
      };

      this.save.emit(updatedCard);
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  onCardConfigSave(configuration: any) {
    // Ne pas inclure les propriétés de base dans la configuration
    const updatedCard: CardDto = {
      ...this.card,
      configuration: configuration.toJson() // toJson() ne retourne que les propriétés spécifiques
    };
    this.save.emit(updatedCard);
  }

  calculateMaxWidth(): number {
    // Calculer l'espace utilisé par les autres cartes
    const usedSpace = this.row.cards
      .filter(c => c.id !== this.card.id) // Exclure la carte en cours d'édition
      .reduce((total, card) => total + (card.gridWidth || 4), 0);
    
    // La largeur maximale est l'espace disponible dans la ligne
    this.maxAvailableWidth = 12 - usedSpace;
    return this.maxAvailableWidth;
  }
} 