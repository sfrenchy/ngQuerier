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


export interface User {
  Id: string;
  Email: string;
  FirstName: string;
  LastName: string;
  Phone: string | null;
  Roles: Role[];
  LanguageCode: string | null;
  Img: string | null;
  Poste: string | null;
  UserName: string;
  DateFormat: string | null;
  Currency: string | null;
  AreaUnit: string | null;
  IsEmailConfirmed: boolean;
}

export interface ApiUser {
  Id: string;
  Email: string;
  FirstName: string;
  LastName: string;
  RoleId: string;
  IsEmailValidated: boolean;
}

export interface Role {
  Id: string;
  Name: string;
}

export interface DBConnection {
  Id: number;
  Name: string;
  ConnectionType: QDBConnectionType;
  ConnectionString: string;
  ApiRoute: string;
  GenerateProcedureControllersAndServices?: boolean;
}

export enum QDBConnectionType {
  SqlServer = 0,
  MySQL = 1,
  PgSQL = 2
}

export interface MenuCategory {
  Id: number;
  Names: { [key: string]: string };
  Icon: string;
  Order: number;
  IsVisible: boolean;
  Roles: string[];
  Route: string;
}

export interface MenuPage {
  Id: number;
  Names: { [key: string]: string };
  Icon: string;
  Order: number;
  IsVisible: boolean;
  Roles: Role[];
  Route: string;
  MenuCategoryId: number;
}

export interface DynamicRow {
  id: number;
  pageId: number;
  order: number;
  height: number;
  cards: DynamicCard[];
}

export interface DynamicCard {
  id: number;
  rowId: number;
  order: number;
  width: number;
  type: string;
  titles: { [key: string]: string };
  configuration: any;
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
    cards: DynamicCard[];
  }[];
}

export interface EntitySchema {
  name: string;
  displayName: string;
  properties: EntityProperty[];
}

export interface EntityProperty {
  name: string;
  type: string;
  isKey: boolean;
  isNullable: boolean;
}

export interface SQLQuery {
  Id: number;
  Name: string;
  Description: string;
  Query: string;
  ConnectionId: number;
  IsPublic: boolean;
  Parameters?: { [key: string]: any };
  CreatedAt?: Date;
  LastModifiedAt?: Date;
  CreatedBy?: string;
  OutputDescription?: string;
}

export interface SQLQueryParameter {
  name: string;
  type: string;
  isRequired: boolean;
}

export interface SQLQueryRequest {
  query: SQLQuery;
  sampleParameters?: { [key: string]: any };
}

export interface QueryAnalysis {
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

export interface UserCreateUpdate {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userName: string;
  roles: string[];
}

export interface ApiDynamicCard {
  Id: number;
  Titles: { [key: string]: string };
  Order: number;
  Type: string;
  GridWidth: number;
  Configuration: any;
  BackgroundColor: string | null;
  TextColor: string | null;
  HeaderBackgroundColor: string | null;
  HeaderTextColor: string | null;
}

export interface ApiLayout {
  PageId: number;
  Icon: string;
  Names: { [key: string]: string };
  IsVisible: boolean;
  Roles: string[];
  Route: string;
  Rows: {
    Id: number;
    Order: number;
    Height: number;
    Cards: ApiDynamicCard[];
  }[];
} 