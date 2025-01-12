import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiEndpoints } from './api-endpoints';
import {
  User,
  RoleDto,
  DBConnectionDto,
  PageDto,
  SQLQueryRequest,
  ApiConfiguration,
  SignUpDto,
  RefreshTokenDto,
  AuthResultDto,
  SignUpResultDto,
  SignInDto,
  SettingDto,
  DBConnectionDatabaseSchemaDto,
  DBConnectionQueryAnalysisDto,
  ApiUserCreateDto,
  ApiUserUpdateDto,
  DBConnectionCreateDto,
  DBConnectionAnalyzeQueryDto,
  MenuDto,
  MenuCreateDto,
  PageCreateDto,
  LayoutDto,
  EntityDefinitionDto,
  PaginationParametersDto,
  PaginatedResultDto,
  SQLQueryDto
} from '@models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl: string = '';

  constructor(private http: HttpClient) {
    this.baseUrl = localStorage.getItem('baseUrl') || '';
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url;
    localStorage.setItem('baseUrl', url);
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  // Generic HTTP methods
  get<T>(endpoint: string, params?: any): Observable<T> {
    const url = ApiEndpoints.buildUrl(this.baseUrl, endpoint);
    return this.http.get<T>(url, { params });
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    const url = ApiEndpoints.buildUrl(this.baseUrl, endpoint);
    return this.http.post<T>(url, body);
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    const url = ApiEndpoints.buildUrl(this.baseUrl, endpoint);
    return this.http.put<T>(url, body);
  }

  patch<T>(endpoint: string, data: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, data);
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`);
  }

  // Auth Methods
  signIn(dto: SignInDto): Observable<SignUpResultDto> {
    return this.http.post<SignUpResultDto>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.signIn),
      dto
    );
  }

  signUp(dto: SignUpDto): Observable<SignUpResultDto> {
    return this.http.post<SignUpResultDto>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.signUp),
      {}
    );
  }

  refreshToken(refreshToken: RefreshTokenDto): Observable<AuthResultDto> {
    return this.http.post<AuthResultDto>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.refreshToken),
      { refreshToken }
    );
  }

  signOut(refreshToken: string): Observable<AuthResultDto> {
    return this.http.post<AuthResultDto>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.signOut),
      { refreshToken }
    );
  }

  // Settings Methods
  getSettings(): Observable<SettingDto[]> {
    return this.http.get<SettingDto[]>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.getSettings)
    );
  }

  updateSettings(settings: SettingDto): Observable<SettingDto> {
    return this.http.post<SettingDto>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.updateSettings),
      settings
    );
  }

  checkConfiguration(): Observable<boolean> {
    return this.get<boolean>(ApiEndpoints.isConfigured);
  }

  // User Management Methods
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.currentUser)
    );
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.users)
    );
  }

  addUser(user: ApiUserCreateDto): Observable<User> {
    return this.http.post<User>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.addUser),
      user
    );
  }

  updateUser(id: string, user: ApiUserUpdateDto): Observable<User> {
    return this.http.put<User>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.updateUser),
      { ...user, id }
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.deleteUser, { id })
      )
    );
  }

  resendConfirmationEmail(userEmail: string): Observable<any> {
    return this.http.post(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.resendConfirmationEmail),
      { userEmail }
    );
  }

  // Role Methods
  getAllRoles(): Observable<RoleDto[]> {
    return this.http.get<RoleDto[]>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.roles)
    );
  }

  addRole(name: string): Observable<RoleDto> {
    return this.http.post<RoleDto>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.addRole),
      { id: '', name }
    );
  }

  updateRole(dto: RoleDto): Observable<RoleDto> {
    return this.http.put<RoleDto>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.updateRole),
      dto
    );
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.deleteRole, { id })
      )
    );
  }

  // DB Connection Methods
  getDBConnections(): Observable<DBConnectionDto[]> {
    return this.http.get<DBConnectionDto[]>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.dbConnections)
    );
  }

  addDBConnection(connection: DBConnectionCreateDto): Observable<DBConnectionDto> {
    return this.http.post<DBConnectionDto>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.addDbConnection),
      connection
    );
  }

  deleteDBConnection(id: number): Observable<void> {
    console.log('API Service - Deleting connection with ID:', id);
    const url = ApiEndpoints.buildUrl(
      this.baseUrl,
      ApiEndpoints.replaceUrlParams(ApiEndpoints.deleteDbConnection, { id: id.toString() })
    );
    console.log('Delete URL:', url);
    return this.http.delete<void>(url);
  }

  getDatabaseSchema(id: number): Observable<DBConnectionDatabaseSchemaDto> {
    return this.http.get<DBConnectionDatabaseSchemaDto>(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.dbConnectionSchema, {
          id: id.toString()
        })
      )
    );
  }

  analyzeQuery(id: number, dto: DBConnectionAnalyzeQueryDto): Observable<DBConnectionQueryAnalysisDto> {
    return this.http.post<DBConnectionQueryAnalysisDto>(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.analyzeQuery, {
          connectionId: id.toString()
        })
      ),
      { dto }
    );
  }

  // Menu Category Methods
  getMenus(): Observable<MenuDto[]> {
    return this.http.get<MenuDto[]>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.menus)
    );
  }

  getMenu(id: number): Observable<MenuDto> {
    return this.http.get<MenuDto>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.replaceUrlParams(ApiEndpoints.menuById, { id: id.toString() }))
    );
  }

  createMenu(category: MenuCreateDto): Observable<MenuDto> {
    return this.http.post<MenuDto>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.addMenu),
      category
    );
  }

  updateMenu(id: number, menu: MenuDto): Observable<MenuDto> {
    return this.http.put<MenuDto>(
      `${ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.updateMenu)}/${id}`,
      menu
    );
  }

  deleteMenuCategory(id: number): Observable<any> {
    return this.http.delete(
      `${ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.deleteMenu)}/${id}`
    );
  }

  // Page Methods
  getPages(): Observable<PageDto[]> {
    return this.http.get<PageDto[]>(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.pages
      )
    );
  }

  getMenuPages(menuId: number): Observable<PageDto[]> {
    return this.http.get<PageDto[]>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.replaceUrlParams(ApiEndpoints.pagesByMenuId, { menuId: menuId.toString() }))
    );
  }

  getPage(id: number): Observable<PageDto> {
    return this.http.get<PageDto>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.replaceUrlParams(ApiEndpoints.pageById, { id: id.toString() }))
    );
  }

  createPage(page: Partial<PageCreateDto>): Observable<PageDto> {
    return this.http.post<PageDto>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.pages),
      page
    );
  }

  updatePage(id: number, page: PageDto): Observable<PageDto> {
    return this.http.put<PageDto>(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.updatePage, {
          id: id.toString()
        })
      ),
      page
    );
  }

  deletePage(id: number): Observable<void> {
    return this.http.delete<void>(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.deletePage, {
          id: id.toString()
        })
      )
    );
  }

  // Layout Methods
  getLayout(id: number): Observable<LayoutDto> {
    return this.http.get<LayoutDto>(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.getLayout, {
          pageId: id.toString()
        })
      )
    );
  }

  updateLayout(pageId: number, layout: LayoutDto): Observable<LayoutDto> {
    return this.http.put<LayoutDto>(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.updateLayout, {
          pageId: pageId.toString()
        })
      ),
      layout
    );
  }

  deleteLayout(pageId: number): Observable<void> {
    return this.http.delete<void>(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.deleteLayout, { pageId: pageId.toString() })
      )
    );
  }

  // Datasources Methods
  getDatasourceContexts(): Observable<string[]> {
    return this.http.get<string[]>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.datasourcesContexts)
    );
  }

  getDatasourceContextEntities(contextName: string): Observable<EntityDefinitionDto[]> {
    return this.http.get<EntityDefinitionDto[]>(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.datasourceContextEntities, {
          contextName: contextName
        })
      )
    );
  }

  getDatasourceContextEntity(
    contextName: string,
    entityName: string
  ): Observable<EntityDefinitionDto> {
    return this.http.get<EntityDefinitionDto>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.replaceUrlParams(ApiEndpoints.datasourceContextEntity, {
          contextName: contextName,
          entityName: entityName
        })
      )
    );
  }

  getEntityRecords(
    contextName: string,
    entityName: string,
    paginationParameters: PaginationParametersDto,
    orderBy: string = ''
  ): Observable<{ items: any[]; total: number }> {

    return this.http.post<PaginatedResultDto<any>>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.replaceUrlParams(ApiEndpoints.datasourceContextEntityRecords, {
        contextName: contextName,
        entityName: entityName
      })), 
      paginationParameters
    );
  }

  // SQL Query Methods
  getSQLQueries(): Observable<SQLQueryDto[]> {
    return this.http.get<SQLQueryDto[]>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.sqlQueries)
    );
  }

  getSQLQuery(id: number): Observable<SQLQueryDto> {
    return this.http.get<SQLQueryDto>(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.sqlQuery, {
          id: id.toString()
        })
      )
    );
  }

  createSQLQuery(
    query: SQLQueryDto,
    sampleParameters?: { [key: string]: any }
  ): Observable<SQLQueryDto> {
    const request: SQLQueryRequest = {
      query,
      sampleParameters
    };

    return this.http.post<SQLQueryDto>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.sqlQueries),
      request
    );
  }

  updateSQLQuery(
    id: number,
    query: SQLQueryDto,
    sampleParameters?: { [key: string]: any }
  ): Observable<SQLQueryDto> {
    const request: SQLQueryRequest = {
      query,
      sampleParameters
    };

    return this.http.put<SQLQueryDto>(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.sqlQuery, {
          id: id.toString()
        })
      ),
      request
    );
  }

  deleteSQLQuery(id: number): Observable<any> {
    return this.http.delete(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.sqlQuery, {
          id: id.toString()
        })
      )
    );
  }

  executeQuery(
    queryName: string,
    pageNumber: number = 1,
    pageSize: number = 0
  ): Observable<{ items: any[]; total: number }> {
    return this.getSQLQueries().pipe(
      map(queries => {
        const query = queries.find(q => q.name === queryName);
        if (!query) {
          throw new Error(`Query not found: ${queryName}`);
        }
        return query;
      }),
      switchMap(query => {
        const params = new HttpParams()
          .set('pageNumber', pageNumber.toString())
          .set('pageSize', pageSize.toString());

        return this.http.post<{ items: any[]; total: number }>(
          ApiEndpoints.buildUrl(
            this.baseUrl,
            ApiEndpoints.replaceUrlParams(ApiEndpoints.executeSqlQuery, {
              id: query.id.toString()
            })
          ),
          {},
          { params }
        );
      })
    );
  }

  // Configuration Methods
  testSmtpConfiguration(config: {
    host: string;
    port: number;
    useSSL: boolean;
    requireAuth: boolean;
    username?: string;
    password?: string;
    senderEmail: string;
    senderName: string;
  }): Observable<boolean> {
    return this.post<boolean>(ApiEndpoints.smtpTest, config);
  }

  setup(config: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    host: string;
    port: number;
    useSSL: boolean;
    requireAuth: boolean;
    username?: string;
    smtpPassword?: string;
    senderEmail: string;
    senderName: string;
  }): Observable<boolean> {
    return this.post<boolean>(ApiEndpoints.setup, {
      admin: {
        name: config.lastName,
        firstName: config.firstName,
        email: config.email,
        password: config.password,
      },
      smtp: {
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.smtpPassword,
        useSSL: config.useSSL,
        senderEmail: config.senderEmail,
        senderName: config.senderName,
      },
    });
  }

  isAuthenticated(): Observable<boolean> {
    const token = localStorage.getItem('access_token');
    return of(!!token);
  }

  // API Configuration Methods
  getApiConfiguration(): Observable<ApiConfiguration> {
    return this.http.get<ApiConfiguration>(`${this.baseUrl}/settings/api-configuration`);
  }

  updateApiConfiguration(config: ApiConfiguration): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/settings/api-configuration`, config);
  }

  // SQL Queries
  getQueries(): Observable<SQLQueryDto[]> {
    return this.http.get<SQLQueryDto[]>(`${this.baseUrl}/SQLQuery`);
  }

  getQuery(id: number): Observable<SQLQueryDto> {
    return this.http.get<SQLQueryDto>(`${this.baseUrl}/SQLQuery/${id}`);
  }

  createQuery(query: SQLQueryDto): Observable<SQLQueryDto> {
    return this.http.post<SQLQueryDto>(`${this.baseUrl}/SQLQuery`, query);
  }

  updateQuery(id: number, query: SQLQueryDto): Observable<SQLQueryDto> {
    return this.http.put<SQLQueryDto>(`${this.baseUrl}/SQLQuery/${id}`, query);
  }

  deleteQuery(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/SQLQuery/${id}`);
  }
} 