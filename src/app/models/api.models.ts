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
  connectionString: string;
  contextApiRoute: string;
  generateProcedureControllersAndServices: boolean;
}

export interface DBConnectionDto {
  id: number;
  name: string;
  connectionType: DBConnectionType;
  connectionString: string;
  apiRoute: string;
  contextName: string;
  description: string;
}

export enum DBConnectionType {
  SqlServer = 0,
  MySQL = 1,
  PgSQL = 2
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

export interface DBConnectionTableDescriptionDto{
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

export interface EntityDefinitionDto {
  name: string;
  displayName: string;
  properties: EntityPropertyDto[];
}

export interface EntityPropertyDto {
  name: string;
  type: string;
  options: ["IsReadOnly" | "IsForeignKey" | "IsKey" | "IsNullable"];
  availableItems: PropertyItemDefinitionDto[];
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

export interface LayoutDto {
  pageId: number;
  rows: RowDto[];
} 

export interface RowDto {
  id: number;
  order: number;
  height: number;
  cards: CardDto[];
}

export interface CardDto {
  id: number;
  titles: { [key: string]: string };
  order: number;
  type: string;
  gridwidth: number;
  configuration: any;
  backgroundColor: string;
  textColor: string;
  headerBackgroundColor: string;
  headerTextColor: string;
  rowId: number;
}

export interface PaginationParametersDto {
  pageNumber: number;
  pageSize: number;
}

export interface PaginatedResultDto<T> {
  items: T[];
  total: number;
}