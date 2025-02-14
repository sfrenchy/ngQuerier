import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Type,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {CardDto, RowDto} from '@models/api.models';
import {
  TranslatableStringFormComponent
} from '@shared/components/translatable-string-form/translatable-string-form.component';
import {TileComponent} from '@shared/components/tile/tile.component';
import {CardRegistry} from '../card.registry';
import {hexToUint, uintToHex} from '../../shared/utils/color.utils';
import {IconSelectorComponent} from '@shared/components/icon-selector/icon-selector.component';
import {CardDatabaseService} from '../card-database.service';
import {ChartVisualConfig} from '@models/chart.models';
import {
  ChartVisualConfigurationComponent
} from '@shared/components/chart-visual-configuration/chart-visual-configuration.component';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {CardConfigFactory} from '../card-config.factory';
import {ValidationError} from '../validation/validation.models';
import {CardConfigAdapterService} from '@cards/card-config-adapter.service';

@Component({
  selector: 'app-base-card-configuration',
  templateUrl: './base-card-configuration.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TileComponent,
    IconSelectorComponent,
    TranslatableStringFormComponent,
    ChartVisualConfigurationComponent,
    TranslateModule
  ]
})
export class BaseCardConfigurationComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() card!: CardDto;
  @Input() row!: RowDto;
  @Input() isFullscreen = false;
  @Input() maxAvailableWidth = 12;
  @Input() isChartCard = false;

  @Input() set visualConfig(value: ChartVisualConfig | undefined) {
    if (value) {
      this._visualConfig = value;
    } else if (!this._visualConfig) {
      // Only set default if we don't have a previous configuration
      this._visualConfig = this.card?.configuration?.visualConfig || {
        backgroundColor: '#1f2937',
        textColor: '#ffffff',
        legend: {
          show: true,
          position: 'right'
        },
        tooltip: {
          show: true,
          trigger: 'axis'
        },
        toolbox: {
          features: {
            dataZoom: false,
            restore: false,
            saveAsImage: true
          }
        }
      };
    }
  }

  get visualConfig(): ChartVisualConfig {
    return this._visualConfig;
  }

  private _visualConfig!: ChartVisualConfig;
  @Output() save = new EventEmitter<CardDto>();
  @Output() cancel = new EventEmitter<void>();
  @Output() toggleFullscreen = new EventEmitter<void>();
  @Output() visualConfigChange = new EventEmitter<ChartVisualConfig>();
  @ViewChild('configContainer', {read: ViewContainerRef}) configContainer!: ViewContainerRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  form!: FormGroup;
  cardConfigComponent?: Type<any>;
  private colorFields = ['backgroundColor', 'textColor', 'headerTextColor', 'headerBackgroundColor'];
  private cardConfigFactory?: CardConfigFactory<any>;
  validationErrors: ValidationError[] = [];
  private componentRef?: any;

  constructor(
    private fb: FormBuilder,
    protected cardDatabaseService: CardDatabaseService,
    private injector: Injector,
    protected translateService: TranslateService,
    protected cardConfigAdapter: CardConfigAdapterService
  ) {
  }

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

    // Initialiser la configuration visuelle avec celle de la carte
    if (this.isChartCard && this.card.configuration?.visualConfig) {
      this.visualConfig = this.card.configuration.visualConfig;
    }

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
      this.cardConfigFactory = this.injector.get(metadata.configFactory);
    }
  }

  ngAfterViewInit() {
    if (this.cardConfigComponent && this.configContainer) {
      // Stocker la référence du composant
      this.componentRef = this.configContainer.createComponent(this.cardConfigComponent);

      // Définir les inputs
      this.componentRef.setInput('card', this.card);
      this.componentRef.setInput('validationErrors', this.validationErrors);

      // S'abonner aux outputs
      this.componentRef.instance.save?.subscribe((configuration: any) => {
        this.onCardConfigSave(configuration);
      });

      // S'abonner aux changements en temps réel
      this.componentRef.instance.configChange?.subscribe((configuration: any) => {
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
      this.form.patchValue({[controlName]: value}, {emitEvent: false});
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

      // Valider avec la factory si elle existe
      if (!this.cardConfigFactory || this.validateCard(updatedCard)) {
        this.save.emit(updatedCard);
      } else {
        console.error('Card configuration validation failed');
        // Optionnellement, afficher un message à l'utilisateur
      }
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  onCardConfigSave(configuration: any) {
    const newConfig = configuration.toJson();

    // Ne pas inclure les propriétés de base dans la configuration
    const updatedCard: CardDto = {
      ...this.card,
      configuration: {
        ...newConfig,
        visualConfig: this.card.configuration?.visualConfig,
        datasource: {
          ...newConfig.datasource,
          procedureParameters: this.card.configuration?.datasource?.procedureParameters
        }
      }
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

  onVisualConfigChange(config: ChartVisualConfig) {
    // Mettre à jour directement la configuration de la carte
    if (this.card.configuration) {
      this.card.configuration.visualConfig = config;
    }
    this.visualConfigChange.emit(config);
  }

  validateCard(card: CardDto): boolean {
    // Réinitialiser les erreurs
    this.validationErrors = [];

    const result = this.cardConfigFactory?.validateConfig(card.configuration);
    if (result) {
      this.validationErrors = result.errors;
      this.applyValidationErrorsToForm();
      return result.isValid;
    }
    return true;
  }

  private applyValidationErrorsToForm() {
    // Reset form errors
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.setErrors(null);
    });

    // Apply new errors
    this.validationErrors.forEach(error => {
      if (error.controlPath) {
        const control = this.form.get(error.controlPath);
        if (control) {
          const errors = control.errors || {};
          errors[error.code] = true;
          control.setErrors(errors);
        }
      }
    });

    // Transmettre les erreurs au composant enfant
    if (this.componentRef) {
      this.componentRef.setInput('validationErrors', this.validationErrors);
    }
  }

  getControlErrors(controlPath: string): ValidationError[] {
    return this.validationErrors.filter(error => error.controlPath === controlPath);
  }

  ngOnDestroy() {
    // Clean up any subscriptions or resources if needed
  }

  exportConfig() {
    // Créer une copie de la carte avec les valeurs actuelles du formulaire
    const cardToExport = {
      id: 0,  // On met 0 car c'est une nouvelle carte
      type: this.card.type,
      title: this.form.value.title,
      order: 0,
      gridWidth: this.form.value.gridWidth,
      backgroundColor: this.convertHexToUint(this.form.value.backgroundColor),
      textColor: this.convertHexToUint(this.form.value.textColor),
      headerTextColor: this.convertHexToUint(this.form.value.headerTextColor),
      headerBackgroundColor: this.convertHexToUint(this.form.value.headerBackgroundColor),
      rowId: 0,  // On met 0 car c'est une nouvelle carte
      displayHeader: this.form.value.displayHeader,
      displayFooter: this.form.value.displayFooter,
      icon: this.form.value.icon,
      configuration: this.card.configuration
    };

    const blob = new Blob([JSON.stringify(cardToExport, null, 2)], {type: 'application/json'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.card.type}-config.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  importConfig(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedCard = JSON.parse(e.target?.result as string);

        // Ignorer les propriétés structurantes
        const {id, order, gridWidth, rowId, ...cardToImport} = importedCard;

        // Mettre à jour la configuration spécifique
        this.card.configuration = cardToImport.configuration;

        // Mettre à jour les propriétés de base de la carte
        this.card.title = [...cardToImport.title];
        this.card.backgroundColor = cardToImport.backgroundColor;
        this.card.textColor = cardToImport.textColor;
        this.card.headerTextColor = cardToImport.headerTextColor;
        this.card.headerBackgroundColor = cardToImport.headerBackgroundColor;
        this.card.displayHeader = cardToImport.displayHeader;
        this.card.displayFooter = cardToImport.displayFooter;
        this.card.icon = cardToImport.icon;

        // Forcer une réinitialisation complète du formulaire
        const formValues = {
          title: cardToImport.title,
          backgroundColor: this.convertUintToHex(cardToImport.backgroundColor),
          textColor: this.convertUintToHex(cardToImport.textColor),
          headerTextColor: this.convertUintToHex(cardToImport.headerTextColor),
          headerBackgroundColor: this.convertUintToHex(cardToImport.headerBackgroundColor),
          displayHeader: cardToImport.displayHeader,
          displayFooter: cardToImport.displayFooter,
          icon: cardToImport.icon,
          gridWidth: this.form.get('gridWidth')?.value // Garder la valeur actuelle
        };

        this.form.reset(formValues);
        this.form.setValue(formValues, {emitEvent: true});

      } catch (error) {
        console.error('Error importing configuration:', error);
      }
      input.value = '';
    };
    reader.readAsText(file);
  }
}
