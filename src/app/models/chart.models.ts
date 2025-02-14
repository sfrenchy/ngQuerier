import {BaseCardConfig} from './api.models';
import {DatasourceConfig} from './datasource.models';
import {ChartParameters} from './parameters.models';

export interface ChartVisualConfig {
  backgroundColor?: string;
  textColor?: string;
  animation?: boolean;
  animationDuration?: number;
  animationEasing?: string;
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
    showContent?: boolean;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    padding?: number | number[];
    textStyle?: {
      color?: string;
      fontSize?: number;
    };
  };
  toolbox?: {
    show?: boolean;
    orient?: 'horizontal' | 'vertical';
    itemSize?: number;
    itemGap?: number;
    showTitle?: boolean;
    feature?: {
      dataZoom?: {
        show?: boolean;
        title?: {
          zoom?: string;
          back?: string;
        };
      };
      restore?: {
        show?: boolean;
        title?: string;
      };
      saveAsImage?: {
        show?: boolean;
        title?: string;
      };
      dataView?: {
        show?: boolean;
        title?: string;
        lang?: string[];
      };
      magicType?: {
        show?: boolean;
        type?: string[];
        title?: {
          line?: string;
          bar?: string;
          stack?: string;
        };
      };
    };
    iconStyle?: {
      color?: string;
      borderColor?: string;
      borderWidth?: number;
    };
  };
  title?: {
    show?: boolean;
    text?: string;
    subtext?: string;
    left?: string | number;
    top?: string | number;
    textStyle?: {
      color?: string;
      fontSize?: number;
    };
    subtextStyle?: {
      color?: string;
      fontSize?: number;
    };
  };
}

export abstract class BaseChartConfig implements BaseCardConfig {
  datasource!: DatasourceConfig;
  visualConfig!: ChartVisualConfig;
  chartParameters?: ChartParameters;

  toJson(): any {
    return {
      datasource: this.datasource,
      visualConfig: this.visualConfig,
      chartParameters: this.chartParameters
    };
  }

  static fromJson(json: any): BaseChartConfig {
    const config = new (this as any)();
    config.datasource = json.datasource;
    config.visualConfig = json.visualConfig;
    config.chartParameters = json.chartParameters;
    return config;
  }
}

export interface ChartState {
  data: any[];
  loading: boolean;
  error?: string;
}
