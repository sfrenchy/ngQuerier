import {BaseCardConfig, TranslatableString} from '@models/api.models';

export class HTMLContentCardConfig extends BaseCardConfig {
  content: {
    html?: TranslatableString[];
  };

  constructor() {
    super();
    this.content = {
      html: [
        {languageCode: 'fr', value: '<p>Nouveau contenu HTML</p>'},
        {languageCode: 'en', value: '<p>New HTML content</p>'}
      ]
    };
  }

  validate(): string[] {
    const errors: string[] = [];
    if (!this.content.html?.length) {
      errors.push('HTMLCONTENT_CARD.ERRORS.NO_CONTENT');
    }
    return errors;
  }
}
