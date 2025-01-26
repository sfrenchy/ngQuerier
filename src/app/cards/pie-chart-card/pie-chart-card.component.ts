import { Component, Type, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Card } from '@cards/card.decorator';
import { PieChartCardConfigurationComponent } from './pie-chart-card-configuration.component';
import { BaseCardConfig } from '@models/api.models';
import { BaseCardComponent } from '@cards/base-card.component';
import { PieChartCardService } from './pie-chart-card.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export class PieChartCardConfig extends BaseCardConfig {
  constructor() {
    super();
  }

  toJson(): any {
    return {
      // Add your specific properties here
    };
  }

  static fromJson(json: any): PieChartCardConfig {
    return new PieChartCardConfig();
  }
}

@Card({
  name: 'PieChart',
  translationPath: 'pie-chart-card',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
    <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
  </svg>`,
  configComponent: PieChartCardConfigurationComponent as Type<any>,
  configType: PieChartCardConfig,
  defaultConfig: () => new PieChartCardConfig()
})
@Component({
  selector: 'app-pie-chart-card',
  templateUrl: './pie-chart-card.component.html',
  standalone: true,
  imports: [CommonModule, TranslateModule, BaseCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PieChartCardComponent extends BaseCardComponent<PieChartCardConfig> implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  loading = false;
  hasData = false;

  constructor(
    private cardService: PieChartCardService,
    protected override translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    super(translateService);
  }

  override ngOnInit() {
    super.ngOnInit();
    this.loadCardTranslations();
    // Subscribe to state changes from the service
    // Example:
    // this.cardService.getState(this.card.configuration)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(state => {
    //     // Update component state
    //     this.cdr.markForCheck();
    //   });
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.destroy$.next();
    this.destroy$.complete();
  }
} 