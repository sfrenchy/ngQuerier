export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userName: string;
  roles: string[];
}

export interface Role {
  Id: string;
  Name: string;
}

export interface DBConnection {
  id: number;
  name: string;
  connectionString: string;
  provider: string;
}

export interface MenuCategory {
  id: number;
  names: { [key: string]: string };
  icon: string;
  order: number;
  isVisible: boolean;
  roles: string[];
}

export interface MenuPage {
  id: number;
  names: { [key: string]: string };
  icon: string;
  order: number;
  isVisible: boolean;
  roles: string[];
  route: string;
  menuCategoryId: number;
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
  configuration: any;
}

export interface Layout {
  pageId: number;
  rows: DynamicRow[];
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
  id: number;
  name: string;
  description: string;
  query: string;
  parameters: SQLQueryParameter[];
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