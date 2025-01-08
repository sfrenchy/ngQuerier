export interface DynamicRow {
  id: number;
  order: number;
  height: number;
  cards: DynamicCard[];
  alignment: 'start' | 'center' | 'end';
  spacing: number;
}

export interface BaseCard {
  id: number;
  type: string;
  order: number;
  gridWidth: number;
  titles: { [key: string]: string };
  backgroundColor?: string;
  textColor?: string;
  headerBackgroundColor?: string;
  headerTextColor?: string;
  configuration?: any;
}

export interface DynamicCard extends BaseCard {
  type: string;
}

export interface PlaceholderCard extends BaseCard {
  type: 'placeholder';
  configuration: {
    showHeader: boolean;
    showFooter: boolean;
    centerLabel: {
      [key: string]: string;
    };
  };
}

export interface PageLayout {
  id: number;
  rows: DynamicRow[];
  isDirty: boolean;
  icon?: string;
  names?: { [key: string]: string };
  isVisible?: boolean;
  roles?: string[];
  route?: string;
} 