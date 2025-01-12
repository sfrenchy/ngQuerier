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
  names: { [key: string]: string };
  icon: string;
  order: number;
  isVisible: boolean;
  roles: string[];
  route: string;
}

export interface MenuCreateDto {
  names: { [key: string]: string };
  icon: string;
  order: number;
  isVisible: boolean;
  roles: string[];
  route: string;
}

export interface PageDto {
  id: number;
  names: { [key: string]: string };
  icon: string;
  order: number;
  isVisible: boolean;
  roles: RoleDto[];
  route: string;
  menuId: number;
}

export interface PageCreateDto {
  names: { [key: string]: string };
  icon: string;
  order: number;
  isVisible: boolean;
  roles: RoleDto[];
  route: string;
  menuId: number;
}

export interface Layout {
  pageId: number;
  icon: string;
  names: { [key: string]: string };
  isVisible: boolean;
  roles: string[];
  route: string;
  rows: {
    id: number;
    order: number;
    height: number;
    alignment: string;
    crossAlignment: string;
    spacing: number;
    cards: CardDto[];
  }[];
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
  Scheme: string;
  Host: string;
  Port: number;
  AllowedHosts: string;
  AllowedOrigins: string;
  AllowedMethods: string;
  AllowedHeaders: string;
  ResetPasswordTokenValidity: number;
  EmailConfirmationTokenValidity: number;
  RequireDigit: boolean;
  RequireLowercase: boolean;
  RequireNonAlphanumeric: boolean;
  RequireUppercase: boolean;
  RequiredLength: number;
  RequiredUniqueChars: number;
  SmtpHost: string;
  SmtpPort: number;
  SmtpUsername: string;
  SmtpPassword: string;
  SmtpUseSSL: boolean;
  SmtpSenderEmail: string;
  SmtpSenderName: string;
  SmtpRequireAuth: boolean;
  RedisEnabled: boolean;
  RedisHost: string;
  RedisPort: number;
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
  icon: string;
  names: { [key: string]: string };
  isVisible: boolean;
  roles: string[];
  route: string;
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