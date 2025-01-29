import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StoredProcedureParameter } from '@models/parameters.models';
import { RequestParametersService } from '@shared/services/request-parameters.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-parameter-popover',
  templateUrl: './parameter-popover.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule]
})
export class ParameterPopoverComponent implements OnChanges, OnInit, OnDestroy {
  @Input() parameter!: StoredProcedureParameter;
  @Input() cardId?: number;
  @Output() parameterChange = new EventEmitter<StoredProcedureParameter>();
  @Output() close = new EventEmitter<void>();

  localParameter?: StoredProcedureParameter;
  private destroy$ = new Subject<void>();

  constructor(
    private requestParametersService: RequestParametersService,
    private translateService: TranslateService
  ) {
    // S'abonner aux changements de langue
    this.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Forcer la mise à jour des traductions
        this.translateService.use(this.translateService.currentLang);
      });
  }

  ngOnInit(): void {
    // Charger les paramètres sauvegardés au démarrage
    if (this.cardId && this.parameter) {
      const savedParams = this.requestParametersService.loadFromLocalStorage(this.cardId);
      if (savedParams?.procedureParameters?.[this.parameter.name]) {
        const savedParameter = savedParams.procedureParameters[this.parameter.name] as StoredProcedureParameter;
        // Ne mettre à jour que si les valeurs sont différentes
        if (savedParameter.value !== this.parameter.value || savedParameter.dateType !== this.parameter.dateType) {
          this.localParameter = { ...savedParameter };
          // Émettre le paramètre chargé uniquement si différent
          this.parameterChange.emit(this.localParameter);
        }
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['parameter']) {
      // Ne mettre à jour le paramètre local que s'il n'existe pas déjà ou si les valeurs sont différentes
      if (!this.localParameter || 
          this.localParameter.value !== this.parameter.value || 
          this.localParameter.dateType !== this.parameter.dateType) {
        this.localParameter = { ...this.parameter };
        if (this.localParameter.type === 'date' && this.localParameter.value) {
          const [datePart] = this.localParameter.value.split('T');
          this.localParameter.value = datePart;
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onValueChange(): void {
    if (this.localParameter) {
      if (this.localParameter.type === 'date' && this.localParameter.value) {
        this.localParameter.value = `${this.localParameter.value}T00:00`;
      }
      this.parameterChange.emit(this.localParameter);

      // Sauvegarder dans le localStorage si un cardId est fourni
      if (this.cardId) {
        const currentParams = this.requestParametersService.loadFromLocalStorage(this.cardId) || {
          pageNumber: 1,
          pageSize: 1000,
          orderBy: [],
          globalSearch: '',
          columnSearches: [],
          procedureParameters: {}
        };

        // Mettre à jour ou ajouter le paramètre
        if (!currentParams.procedureParameters) {
          currentParams.procedureParameters = {};
        }
        currentParams.procedureParameters[this.localParameter.name] = this.localParameter;

        // Sauvegarder les paramètres mis à jour
        this.requestParametersService.saveToLocalStorage(this.cardId, currentParams);
      }
    }
  }
} 