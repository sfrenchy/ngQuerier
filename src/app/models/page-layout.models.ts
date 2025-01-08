export interface DynamicRow {
  id: number;
  order: number;
  height: number;
  cards: DynamicCard[];
}

export interface DynamicCard {
  id: number;
  titles: { [key: string]: string };
  order: number;
  type: string;
  gridWidth: number;
  configuration: string;
  backgroundColor?: number;
  textColor?: number;
  headerBackgroundColor?: number;
  headerTextColor?: number;
}

export interface PlaceholderCard extends DynamicCard {
  type: 'placeholder';
}

export interface PageLayout {
  pageId: number;
  icon?: string;
  names: { [key: string]: string };
  isVisible: boolean;
  roles: string[];
  route: string;
  rows: DynamicRow[];
  isDirty?: boolean;
} 