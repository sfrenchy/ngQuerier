import {BaseCardConfig, TranslatableString} from '@models/api.models';

export class LabelCardConfig extends BaseCardConfig {
  content: {
    text: TranslatableString[];
    fontSize?: number;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
  };

  constructor() {
    super();
    this.content = {
      text: [{languageCode: 'fr', value: 'Nouveau libellé'}, {languageCode: 'en', value: 'New label'}],
      fontSize: 16,
      fontWeight: 'normal',
      textAlign: 'left'
    };
  }
}
