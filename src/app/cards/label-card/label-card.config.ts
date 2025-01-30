import { BaseCardConfig, TranslatableString } from '@models/api.models';

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
      text: [{ languageCode: 'en', value: '' }],
      fontSize: 16,
      fontWeight: 'normal',
      textAlign: 'left'
    };
  }

  toJson(): any {
    return {
      content: this.content
    };
  }

  static fromJson(json: any): LabelCardConfig {
    const config = new LabelCardConfig();
    if (json?.content) {
      config.content = {
        text: Array.isArray(json.content.text) ? json.content.text : [{ languageCode: 'en', value: '' }],
        fontSize: json.content.fontSize || 16,
        fontWeight: json.content.fontWeight || 'normal',
        textAlign: json.content.textAlign || 'left'
      };
    }
    return config;
  }
} 