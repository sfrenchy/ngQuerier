import { TranslatableString } from '@models/api.models';

export interface RegisteredDataTable {
  cardId: number;
  title: TranslatableString[];
  schema: any;
}
