export interface SignInDto {
  email: string;
  password: string;
}

export interface SignUpResultDto {
  token: string;
  refreshToken: string;
  success: boolean;
  errors: string[];
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  roles: string[];
}

export interface SignUpDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface RefreshTokenDto {
  token: string;
  refreshToken: string;
}

export interface AuthResultDto {
  token: string;
  refreshToken: string;
  success: boolean;
  errors: string[];
}

export interface SettingDto {
  id: string;
  name: string;
  value: string;
  description: string;
  type: string;
}


export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  roles: RoleDto[];
  img: string | null;
  poste: string | null;
  userName: string;
  isEmailConfirmed: boolean;
}

export interface ApiUser {
  Id: string;
  Email: string;
  FirstName: string;
  LastName: string;
  RoleId: string;
  IsEmailValidated: boolean;
}

export interface RoleDto {
  id: number;
  name: string;
}

export interface DBConnectionCreateDto {
  name: string;
  connectionType: DBConnectionType;
  parameters: Omit<ConnectionStringParameterDto, 'id'>[];
  contextName: string;
  apiRoute: string;
  generateProcedureControllersAndServices: boolean;
  operationId: string;
}

export interface DBConnectionDto {
  id: number;
  name: string;
  connectionType: DBConnectionType;
  parameters: ConnectionStringParameterDto[];
  contextName: string;
  apiRoute: string;
}

export enum DBConnectionType {
  SqlServer = 0,
  MySQL = 1,
  PgSQL = 2,
  SQLite = 3
}

export interface DBConnectionDatabaseSchemaDto {
  tables: DBConnectionTableDescriptionDto[];
  views: DBConnectionTableDescriptionDto[];
  storedProcedures: DBConnectionProcedureDescriptionDto[];
}

export interface DBConnectionProcedureDescriptionDto {
  name: string;
  schema: string;
  parameters: DBConnectionParameterDescriptionDto[];
}

export interface DBConnectionParameterDescriptionDto {
  name: string;
  dataType: string;
  mode: string;
}

export interface DBConnectionTableDescriptionDto {
  name: string,
  schema: string,
  columns: DBConnectionColumnDescriptionDto[]
}

export interface DBConnectionColumnDescriptionDto {
  name: string;
  dataType: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  foreignKeyTable: string;
  foreignKeyColumn: string;
}

export interface DBConnectionAnalyzeQueryDto {
  query: string;
  parameters: { [key: string]: string };
}

export interface MenuDto {
  id: number;
  title: TranslatableString[];
  icon: string;
  order: number;
  isVisible: boolean;
  roles: RoleDto[];
  route: string;
}

export interface MenuCreateDto {
  title: TranslatableString[];
  icon: string;
  order: number;
  isVisible: boolean;
  roles: RoleDto[];
  route: string;
}

export interface TranslatableString {
  languageCode: string;
  value: string;
}

export interface PageDto {
  id: number;
  title: TranslatableString[];
  icon: string;
  order: number;
  isVisible: boolean;
  roles: RoleDto[];
  route: string;
  menuId: number;
}

export interface PageCreateDto {
  title: TranslatableString[];
  icon: string;
  order: number;
  isVisible: boolean;
  roles: RoleDto[];
  route: string;
  menuId: number;
}

export interface PropertyItemDefinitionDto {
  key: string;
  label: string;
}

export interface SQLQueryCreateDto {
  query: SQLQueryDto;
  parameters: { [key: string]: string };
}

export interface SQLQueryDto {
  id: number;
  name: string;
  description: string;
  query: string;
  dbConnectionId: number;
  isPublic: boolean;
  parameters?: { [key: string]: any };
  createdAt?: Date;
  lastModifiedAt?: Date;
  createdBy?: string;
  createdByEmail?: string;
  outputDescription?: string;
}

export interface SQLQueryParameter {
  name: string;
  type: string;
  isRequired: boolean;
}

export interface SQLQueryRequest {
  query: SQLQueryDto;
  sampleParameters?: { [key: string]: any };
}

export interface DBConnectionQueryAnalysisDto {
  tables: string[];
  columns: string[];
  parameters: string[];
  isValid: boolean;
  errors: string[];
}

export interface ApiConfiguration {
  scheme: string;
  host: string;
  port: number;
  allowedHosts: string;
  allowedOrigins: string;
  allowedMethods: string;
  allowedHeaders: string;
  resetPasswordTokenValidity: number;
  emailConfirmationTokenValidity: number;
  requireDigit: boolean;
  requireLowercase: boolean;
  requireNonAlphanumeric: boolean;
  requireUppercase: boolean;
  requiredLength: number;
  requiredUniqueChars: number;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpUseSSL: boolean;
  smtpSenderEmail: string;
  smtpSenderName: string;
  smtpRequireAuth: boolean;
  redisEnabled: boolean;
  redisHost: string;
  redisPort: number;
}

export interface ApiUserCreateDto {
  email: string;
  firstName: string;
  lastName: string;
  roles: RoleDto[];
}

export interface ApiUserUpdateDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: RoleDto[];
}

export interface BaseCardProperties {
  backgroundColor: number;
  textColor: number;
  headerBackgroundColor: number;
  headerTextColor: number;
  displayHeader: boolean;
  displayFooter: boolean;
  icon: string;
}

export abstract class BaseCardConfig {
  // abstract toJson(): any;
}

export class PlaceholderCardConfig extends BaseCardConfig {
  constructor(public label: string) {
    super();
  }

  toJson(): any {
    return {
      label: this.label
    };
  }

  static fromJson(json: any): PlaceholderCardConfig {
    return new PlaceholderCardConfig(
      json?.label || 'Nouveau placeholder'
    );
  }
}

export interface CardDto<TConfig = any> {
  id: number;
  type: string;
  title: TranslatableString[];
  order: number;
  gridWidth: number;
  backgroundColor: number;
  textColor: number;
  headerTextColor: number;
  headerBackgroundColor: number;
  rowId: number;
  configuration?: TConfig;
  displayHeader: boolean;
  displayFooter: boolean;
  icon: string;
}

export interface CardDtoWithMaxHeight extends CardDto {
  maxHeight?: number;
}

// Type utilitaire pour la factory de configuration
export type CardConfigFactory<T extends BaseCardConfig> = (json: any) => T;

// Fonction utilitaire pour mapper une CardDto depuis le JSON de l'API
export function mapCardFromApi<T extends BaseCardConfig>(
  jsonData: any,
  configFactory: CardConfigFactory<T>
): CardDto<T> {
  return {
    id: jsonData.id,
    type: jsonData.type,
    title: jsonData.title,
    order: jsonData.order,
    gridWidth: jsonData.gridWidth,
    backgroundColor: jsonData.backgroundColor,
    textColor: jsonData.textColor,
    headerTextColor: jsonData.headerTextColor,
    headerBackgroundColor: jsonData.headerBackgroundColor,
    rowId: jsonData.rowId,
    configuration: jsonData.configuration ? configFactory(jsonData.configuration) : undefined,
    displayHeader: jsonData.displayHeader,
    displayFooter: jsonData.displayFooter,
    icon: jsonData.icon
  };
}

// Fonction utilitaire pour mapper un tableau de CardDto depuis le JSON de l'API
export function mapCardsFromApi<T extends BaseCardConfig>(
  jsonData: any[],
  configFactory: CardConfigFactory<T>
): CardDto<T>[] {
  return jsonData.map(card => mapCardFromApi<T>(card, configFactory));
}

// Fonction utilitaire pour mapper une CardDto vers le format JSON pour l'API
export function mapCardToApi<T extends BaseCardConfig>(card: CardDto<T>): any {
  // Extraire les propriétés de base
  const {configuration, ...baseProperties} = card;

  // Retourner l'objet avec la configuration spécifique séparée
  return {
    ...baseProperties,
    configuration: JSON.stringify(configuration) // toJson() ne retourne que les propriétés spécifiques
  };
}

export interface RowDto {
  id: number;
  order: number;
  height: number;
  cards: CardDto[];
}

export interface LayoutDto {
  pageId: number;
  rows: RowDto[];
}

export interface DataRequestDataRequestParametersWithSQLParametersDto {
  dataRequestParameters: DataRequestParametersDto;
  sqlParameters: { [key: string]: string };
}

export interface ForeignKeyIncludeConfig {
  foreignKey: string;
  displayFormat?: string;
  displayColumns?: string[];
}

export interface DataRequestParametersDto {
  pageNumber: number;
  pageSize: number;
  orderBy: OrderByParameterDto[];
  globalSearch: string;
  columnSearches: ColumnSearchDto[];
  includes?: ForeignKeyIncludeConfig[];
  procedureParameters?: { [key: string]: any };
}

export interface ColumnSearchDto {
  column: string;
  value: string;
}

export interface OrderByParameterDto {
  column: string;
  isDescending: boolean;
}

export interface PaginatedResultDto<T> {
  items: T[];
  total: number;
  requestParameters: DataRequestParametersDto;
}

export interface DBConnectionControllerInfoDto {
  name?: string;
  route?: string;
  responseEntityJsonSchema?: string;
  parameterJsonSchema?: string;
}

export interface DBConnectionEndpointInfoDto {
  controller: string;
  targetTable: string;
  action: string;
  route: string;
  httpMethod: string;
  description: string;
  parameters: DBConnectionEndpointRequestInfoDto[];
  responses: DBConnectionEndpointResponseInfoDto[];
}

export interface DBConnectionEndpointResponseInfoDto {
  statusCode: number;
  type: string;
  description: string;
  jsonSchema: string;
}

export interface DBConnectionEndpointRequestInfoDto {
  name: string;
  type: string;
  description: string;
  isRequired: boolean;
  source: string;
  jsonSchema: string;
}

export interface DataStructureDefinitionDto {
  name: string;
  description: string;
  type: string;
  sourceType: DataSourceType;
  jsonSchema: string;
}

export enum DataSourceType {
  Entity = 0,
  StoredProcedure = 1,
  View = 2,
  Query = 3
}

export interface ConnectionStringParameterDto {
  id: number;
  key: string;
  value: string;
  isEncrypted: boolean;
}

export interface SetupAdminDto {
  firstName: string;
  name: string;
  email: string;
  password: string;
}

export interface SetupSmtpDto {
  host: string;
  port: number;
  username: string;
  password: string;
  useSSL: boolean;
  senderEmail: string;
  senderName: string;
}

export interface SetupConfigDto {
  admin: SetupAdminDto;
  smtp: SetupSmtpDto;
  createSample: boolean;
}
