import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ChartVisualConfig } from '@models/chart.models';
import { TileComponent } from '@shared/components/tile/tile.component';

@Component({
  selector: 'app-chart-visual-configuration',
  templateUrl: './chart-visual-configuration.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    TileComponent
  ]
})
export class ChartVisualConfigurationComponent implements OnInit {
  @Input() set config(value: ChartVisualConfig) {
    if (value && this.form) {
      this._config = value;
      this.form.patchValue({
        backgroundColor: value.backgroundColor,
        textColor: value.textColor,
        showLegend: value.legend?.show,
        legendPosition: value.legend?.position,
        showTooltip: value.tooltip?.show,
        tooltipTrigger: value.tooltip?.trigger,
        dataZoom: value.toolbox?.feature?.dataZoom?.show,
        restore: value.toolbox?.feature?.restore?.show,
        saveImage: value.toolbox?.feature?.saveAsImage?.show,
        dataView: value.toolbox?.feature?.dataView?.show,
        magicType: value.toolbox?.feature?.magicType?.show
      }, { emitEvent: false });
    }
  }
  get config(): ChartVisualConfig {
    return this._config;
  }
  private _config!: ChartVisualConfig;
  @Output() configChange = new EventEmitter<ChartVisualConfig>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      // Apparence générale
      backgroundColor: ['#1f2937'],
      textColor: ['#ffffff'],
      
      // Animation
      animation: [true],
      animationDuration: [1000],
      animationEasing: ['cubicOut'],
      
      // Grille
      showGrid: [true],
      gridBorderColor: ['#333'],
      gridBorderWidth: [1],
      gridBackgroundColor: ['transparent'],
      
      // Légende
      showLegend: [true],
      legendPosition: ['right'],
      legendOrient: ['vertical'],
      legendAlign: ['auto'],
      legendPadding: [5],
      legendItemGap: [10],
      legendItemWidth: [25],
      legendItemHeight: [14],
      legendBackgroundColor: ['transparent'],
      legendBorderColor: ['transparent'],
      legendBorderWidth: [0],
      legendBorderRadius: [0],
      legendTextColor: ['#ffffff'],
      legendTextSize: [12],
      
      // Tooltip
      showTooltip: [true],
      tooltipTrigger: ['axis'],
      tooltipShowContent: [true],
      tooltipBackgroundColor: ['rgba(50, 50, 50, 0.7)'],
      tooltipBorderColor: ['#333'],
      tooltipBorderWidth: [0],
      tooltipPadding: [5],
      tooltipTextColor: ['#ffffff'],
      tooltipTextSize: [14],
      
      // Toolbox
      showToolbox: [true],
      toolboxOrient: ['horizontal'],
      toolboxItemSize: [15],
      toolboxItemGap: [10],
      toolboxShowTitle: [true],
      dataZoom: [true],
      restore: [true],
      saveImage: [true],
      dataView: [false],
      magicType: [false],
      
      // Titre
      showTitle: [false],
      titleText: [''],
      titleSubtext: [''],
      titleLeft: ['auto'],
      titleTop: ['auto'],
      titleTextColor: ['#ffffff'],
      titleTextSize: [18],
      titleSubtextColor: ['#aaa'],
      titleSubtextSize: [12]
    });

    this.form.valueChanges.subscribe(value => {
      const config: ChartVisualConfig = {
        backgroundColor: value.backgroundColor,
        textColor: value.textColor,
        
        animation: value.animation,
        animationDuration: value.animationDuration,
        animationEasing: value.animationEasing,
        
        grid: {
          show: value.showGrid,
          borderColor: value.gridBorderColor,
          borderWidth: value.gridBorderWidth,
          backgroundColor: value.gridBackgroundColor,
          containLabel: true
        },
        
        legend: {
          show: value.showLegend,
          position: value.legendPosition,
          orient: value.legendOrient,
          align: value.legendAlign,
          padding: value.legendPadding,
          itemGap: value.legendItemGap,
          itemWidth: value.legendItemWidth,
          itemHeight: value.legendItemHeight,
          backgroundColor: value.legendBackgroundColor,
          borderColor: value.legendBorderColor,
          borderWidth: value.legendBorderWidth,
          borderRadius: value.legendBorderRadius,
          textStyle: {
            color: value.legendTextColor,
            fontSize: value.legendTextSize
          }
        },
        
        tooltip: {
          show: value.showTooltip,
          trigger: value.tooltipTrigger,
          showContent: value.tooltipShowContent,
          backgroundColor: value.tooltipBackgroundColor,
          borderColor: value.tooltipBorderColor,
          borderWidth: value.tooltipBorderWidth,
          padding: value.tooltipPadding,
          textStyle: {
            color: value.tooltipTextColor,
            fontSize: value.tooltipTextSize
          }
        },
        
        toolbox: value.showToolbox ? {
          show: true,
          orient: value.toolboxOrient as 'horizontal' | 'vertical',
          itemSize: value.toolboxItemSize,
          itemGap: value.toolboxItemGap,
          showTitle: value.toolboxShowTitle,
          feature: {
            dataZoom: { 
              show: value.dataZoom,
              title: {
                zoom: 'Zoom',
                back: 'Retour'
              }
            },
            restore: { 
              show: value.restore,
              title: 'Réinitialiser'
            },
            saveAsImage: { 
              show: value.saveImage,
              title: 'Sauvegarder'
            },
            dataView: { 
              show: value.dataView,
              title: 'Données',
              lang: ['Vue données', 'Fermer', 'Actualiser']
            },
            magicType: value.magicType ? {
              show: true,
              type: ['line', 'bar', 'stack'],
              title: {
                line: 'Ligne',
                bar: 'Barre',
                stack: 'Empilé'
              }
            } : undefined
          }
        } : undefined,
        
        title: value.showTitle ? {
          show: true,
          text: value.titleText,
          subtext: value.titleSubtext,
          left: value.titleLeft,
          top: value.titleTop,
          textStyle: {
            color: value.titleTextColor,
            fontSize: value.titleTextSize
          },
          subtextStyle: {
            color: value.titleSubtextColor,
            fontSize: value.titleSubtextSize
          }
        } : undefined
      };
      
      this.configChange.emit(config);
    });
  }

  ngOnInit() {
    if (this._config) {
      this.form.patchValue({
        backgroundColor: this._config.backgroundColor,
        textColor: this._config.textColor,
        
        animation: this._config.animation ?? true,
        animationDuration: this._config.animationDuration ?? 1000,
        animationEasing: this._config.animationEasing ?? 'cubicOut',
        
        showGrid: this._config.grid?.show ?? true,
        gridBorderColor: this._config.grid?.borderColor ?? '#333',
        gridBorderWidth: this._config.grid?.borderWidth ?? 1,
        gridBackgroundColor: this._config.grid?.backgroundColor ?? 'transparent',
        
        showLegend: this._config.legend?.show ?? true,
        legendPosition: this._config.legend?.position ?? 'right',
        legendOrient: this._config.legend?.orient ?? 'vertical',
        legendAlign: this._config.legend?.align ?? 'auto',
        legendPadding: this._config.legend?.padding ?? 5,
        legendItemGap: this._config.legend?.itemGap ?? 10,
        legendItemWidth: this._config.legend?.itemWidth ?? 25,
        legendItemHeight: this._config.legend?.itemHeight ?? 14,
        legendBackgroundColor: this._config.legend?.backgroundColor ?? 'transparent',
        legendBorderColor: this._config.legend?.borderColor ?? 'transparent',
        legendBorderWidth: this._config.legend?.borderWidth ?? 0,
        legendBorderRadius: this._config.legend?.borderRadius ?? 0,
        legendTextColor: this._config.legend?.textStyle?.color ?? '#ffffff',
        legendTextSize: this._config.legend?.textStyle?.fontSize ?? 12,
        
        showTooltip: this._config.tooltip?.show ?? true,
        tooltipTrigger: this._config.tooltip?.trigger ?? 'axis',
        tooltipShowContent: this._config.tooltip?.showContent ?? true,
        tooltipBackgroundColor: this._config.tooltip?.backgroundColor ?? 'rgba(50, 50, 50, 0.7)',
        tooltipBorderColor: this._config.tooltip?.borderColor ?? '#333',
        tooltipBorderWidth: this._config.tooltip?.borderWidth ?? 0,
        tooltipPadding: this._config.tooltip?.padding ?? 5,
        tooltipTextColor: this._config.tooltip?.textStyle?.color ?? '#ffffff',
        tooltipTextSize: this._config.tooltip?.textStyle?.fontSize ?? 14,
        
        showToolbox: this._config.toolbox?.show ?? true,
        toolboxOrient: this._config.toolbox?.orient ?? 'horizontal',
        toolboxItemSize: this._config.toolbox?.itemSize ?? 15,
        toolboxItemGap: this._config.toolbox?.itemGap ?? 10,
        toolboxShowTitle: this._config.toolbox?.showTitle ?? true,
        dataZoom: this._config.toolbox?.feature?.dataZoom?.show ?? true,
        restore: this._config.toolbox?.feature?.restore?.show ?? true,
        saveImage: this._config.toolbox?.feature?.saveAsImage?.show ?? true,
        dataView: this._config.toolbox?.feature?.dataView?.show ?? false,
        magicType: this._config.toolbox?.feature?.magicType?.show ?? false,
        
        showTitle: this._config.title?.show ?? false,
        titleText: this._config.title?.text ?? '',
        titleSubtext: this._config.title?.subtext ?? '',
        titleLeft: this._config.title?.left ?? 'auto',
        titleTop: this._config.title?.top ?? 'auto',
        titleTextColor: this._config.title?.textStyle?.color ?? '#ffffff',
        titleTextSize: this._config.title?.textStyle?.fontSize ?? 18,
        titleSubtextColor: this._config.title?.subtextStyle?.color ?? '#aaa',
        titleSubtextSize: this._config.title?.subtextStyle?.fontSize ?? 12
      }, { emitEvent: false });
    }
  }
} 