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
  type: string;
  order: number;
  gridWidth: number;
  titles: { [key: string]: string };
  configuration?: string;
  backgroundColor?: number;
  textColor?: number;
  headerBackgroundColor?: number;
  headerTextColor?: number;
}

export interface PlaceholderCard extends DynamicCard {
  type: 'placeholder';
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