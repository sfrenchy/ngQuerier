import { BaseCardConfig } from './api.models';
import { EChartsOption } from 'echarts';
import { DatasourceConfig } from './datasource.models';

export interface ChartVisualConfig {
  backgroundColor?: string;
  textColor?: string;
  grid?: {
    left?: string | number;
    right?: string | number;
    top?: string | number;
    bottom?: string | number;
    containLabel?: boolean;
    show?: boolean;
    borderColor?: string;
    borderWidth?: number;
    backgroundColor?: string;
  };
  legend?: {
    show?: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right';
    orient?: 'horizontal' | 'vertical';
    align?: 'auto' | 'left' | 'right';
    padding?: number | number[];
    itemGap?: number;
    itemWidth?: number;
    itemHeight?: number;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number | number[];
    shadowBlur?: number;
    shadowColor?: string;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    icon?: string;
    textStyle?: {
      color?: string;
      fontStyle?: 'normal' | 'italic' | 'oblique';
      fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
      fontFamily?: string;
      fontSize?: number;
      lineHeight?: number;
      backgroundColor?: string;
      borderColor?: string;
      borderWidth?: number;
      borderRadius?: number;
      padding?: number | number[];
      shadowColor?: string;
      shadowBlur?: number;
      shadowOffsetX?: number;
      shadowOffsetY?: number;
    };
  };
  tooltip?: {
    show?: boolean;
    trigger?: 'item' | 'axis' | 'none';
    axisPointer?: {
      type?: 'line' | 'shadow' | 'cross' | 'none';
      axis?: 'x' | 'y' | 'radius' | 'angle';
      snap?: boolean;
      label?: {
        show?: boolean;
        precision?: number | string;
        formatter?: string;
        backgroundColor?: string;
        borderColor?: string;
        borderWidth?: number;
        padding?: number | number[];
      };
      lineStyle?: {
        color?: string;
        width?: number;
        type?: 'solid' | 'dashed' | 'dotted';
        shadowBlur?: number;
        shadowColor?: string;
        shadowOffsetX?: number;
        shadowOffsetY?: number;
        opacity?: number;
      };
      shadowStyle?: {
        color?: string;
        shadowBlur?: number;
        shadowColor?: string;
        shadowOffsetX?: number;
        shadowOffsetY?: number;
        opacity?: number;
      };
      crossStyle?: {
        color?: string;
        width?: number;
        type?: 'solid' | 'dashed' | 'dotted';
        shadowBlur?: number;
        shadowColor?: string;
        shadowOffsetX?: number;
        shadowOffsetY?: number;
        opacity?: number;
      };
    };
    showContent?: boolean;
    alwaysShowContent?: boolean;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    padding?: number | number[];
    textStyle?: {
      color?: string;
      fontStyle?: string;
      fontWeight?: string | number;
      fontFamily?: string;
      fontSize?: number;
      lineHeight?: number;
    };
  };
  toolbox?: {
    show?: boolean;
    orient?: 'horizontal' | 'vertical';
    itemSize?: number;
    itemGap?: number;
    showTitle?: boolean;
    features?: {
      dataZoom?: boolean;
      restore?: boolean;
      saveAsImage?: boolean;
      dataView?: boolean;
      magicType?: boolean;
    };
    iconStyle?: {
      normal?: {
        borderColor?: string;
        borderWidth?: number;
        borderType?: 'solid' | 'dashed' | 'dotted';
        shadowBlur?: number;
        shadowColor?: string;
        shadowOffsetX?: number;
        shadowOffsetY?: number;
        opacity?: number;
      };
      emphasis?: {
        borderColor?: string;
        borderWidth?: number;
        borderType?: 'solid' | 'dashed' | 'dotted';
        shadowBlur?: number;
        shadowColor?: string;
        shadowOffsetX?: number;
        shadowOffsetY?: number;
        opacity?: number;
      };
    };
  };
  animation?: boolean;
  animationThreshold?: number;
  animationDuration?: number;
  animationEasing?: string;
  animationDelay?: number;
  animationDurationUpdate?: number;
  animationEasingUpdate?: string;
  animationDelayUpdate?: number;
  title?: {
    show?: boolean;
    text?: string;
    link?: string;
    target?: 'self' | 'blank';
    textStyle?: {
      color?: string;
      fontStyle?: string;
      fontWeight?: string | number;
      fontFamily?: string;
      fontSize?: number;
      lineHeight?: number;
      backgroundColor?: string;
      borderColor?: string;
      borderWidth?: number;
      borderRadius?: number;
      padding?: number | number[];
      shadowColor?: string;
      shadowBlur?: number;
      shadowOffsetX?: number;
      shadowOffsetY?: number;
    };
    subtext?: string;
    subtextStyle?: {
      color?: string;
      fontStyle?: string;
      fontWeight?: string | number;
      fontFamily?: string;
      fontSize?: number;
      lineHeight?: number;
      backgroundColor?: string;
      borderColor?: string;
      borderWidth?: number;
      borderRadius?: number;
      padding?: number | number[];
      shadowColor?: string;
      shadowBlur?: number;
      shadowOffsetX?: number;
      shadowOffsetY?: number;
    };
    padding?: number | number[];
    itemGap?: number;
    left?: string | number;
    top?: string | number;
    right?: string | number;
    bottom?: string | number;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number | number[];
    shadowBlur?: number;
    shadowColor?: string;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
  };
}

export abstract class BaseChartConfig implements BaseCardConfig {
  datasource!: DatasourceConfig;
  visualConfig!: ChartVisualConfig;

  toJson(): any {
    return {
      datasource: this.datasource,
      visualConfig: this.visualConfig
    };
  }

  static fromJson(json: any): BaseChartConfig {
    const config = new (this as any)();
    config.datasource = json.datasource;
    config.visualConfig = json.visualConfig;
    return config;
  }
}

export interface ChartState {
  data: any[];
  loading: boolean;
  error?: string;
} 