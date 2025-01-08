export interface DynamicRow {
  id: number;
  order: number;
  height: number;
  cards: DynamicCard[];
  alignment: 'start' | 'center' | 'end';
  spacing: number;
}

export interface DynamicCard {
  id: number;
  rowId: number;
  order: number;
  width: number;
  type: string;
  configuration: {
    titles: { [key: string]: string };
    backgroundColor?: string;
    textColor?: string;
    headerBackgroundColor?: string;
    headerTextColor?: string;
    [key: string]: any;
  };
}

export interface PlaceholderCard extends DynamicCard {
  type: 'placeholder';
  configuration: {
    titles: { [key: string]: string };
    backgroundColor?: string;
    textColor?: string;
    headerBackgroundColor?: string;
    headerTextColor?: string;
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