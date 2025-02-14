export interface ICardConfig<T extends BaseCardConfig> {
  getDefaultConfig(): T;

  validateConfig(config: T): boolean;

  transformConfigForSave(config: T): T;
}
