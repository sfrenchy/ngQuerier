import {CardDto} from "./api.models";

export interface PlaceholderCard extends CardDto {
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
