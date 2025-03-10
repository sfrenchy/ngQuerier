import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of, Subject} from 'rxjs';
import {tap} from 'rxjs/operators';
import {ApiEndpoints} from './api-endpoints';
import {
  ApiConfiguration,
  ApiUserCreateDto,
  ApiUserUpdateDto,
  AuthResultDto,
  DataRequestParametersDto,
  DataStructureDefinitionDto,
  DBConnectionAnalyzeQueryDto,
  DBConnectionControllerInfoDto,
  DBConnectionCreateDto,
  DBConnectionDatabaseSchemaDto,
  DBConnectionDto,
  DBConnectionEndpointInfoDto,
  DBConnectionEndpointRequestInfoDto,
  DBConnectionQueryAnalysisDto,
  LayoutDto,
  MenuCreateDto,
  MenuDto,
  PageCreateDto,
  PageDto,
  PaginatedResultDto,
  RefreshTokenDto,
  RoleDto,
  SettingDto,
  SetupAdminDto,
  SetupSmtpDto,
  SignInDto,
  SignUpDto,
  SignUpResultDto,
  SQLQueryCreateDto,
  SQLQueryDto,
  SQLQueryRequest,
  UserDto
} from '@models/api.models';

interface ForeignKeyDataValue {
  id: string;
  value: string;
}

interface ForeignKeyData {
  foreignKey: string;
  values: ForeignKeyDataValue[];
}

interface ExtendedPaginatedResultDto<T> extends PaginatedResultDto<T> {
  foreignKeyData?: ForeignKeyData[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl: string = '';
  private menuUpdated = new Subject<void>();
  private tokenExpirationTimer: any;

  menuUpdated$ = this.menuUpdated.asObservable();

  constructor(private http: HttpClient) {
    this.baseUrl = localStorage.getItem('baseUrl') || '';
    this.setupTokenRenewal();
  }

  private setupTokenRenewal() {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.scheduleTokenRenewal(token);
    }
  }

  private scheduleTokenRenewal(token: string) {
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const expiresIn = (tokenData.exp * 1000) - Date.now();
      const renewalTime = expiresIn - (60 * 1000); // Renew 1 minute before expiration

      if (this.tokenExpirationTimer) {
        clearTimeout(this.tokenExpirationTimer);
      }

      if (renewalTime > 0) {
        this.tokenExpirationTimer = setTimeout(() => {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            this.refreshToken({token, refreshToken}).subscribe({
              next: (result) => {
                localStorage.setItem('access_token', result.token);
                localStorage.setItem('refresh_token', result.refreshToken);
                this.scheduleTokenRenewal(result.token);
              },
              error: () => {
                // Handle error - could emit an event or redirect to login
              }
            });
          }
        }, renewalTime);
      }
    } catch (e) {
      console.error('Error scheduling token renewal:', e);
    }
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
    return this.http.get<T>(url, {params});
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
    ).pipe(
      tap(result => {
        if (result.token) {
          this.scheduleTokenRenewal(result.token);
        }
      })
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
      refreshToken
    );
  }

  signOut(tokenDto: RefreshTokenDto): Observable<AuthResultDto> {
    return this.http.post<AuthResultDto>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.signOut),
      tokenDto
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
    return this.get<boolean>(ApiEndpoints.isConfigured).pipe(
      tap({
        next: (result) => console.log('[API] Configuration check success:', result),
        error: (error) => {
          // Log détaillé de l'erreur pour le débogage
          console.log('[API] Configuration check failed:', {
            status: error?.status,
            statusText: error?.statusText,
            message: error?.message,
            type: error?.type,
            url: `${this.baseUrl}${ApiEndpoints.isConfigured}`,
            error: error // Log de l'erreur complète
          });

          // Si status est 0, cela indique généralement que le serveur est inaccessible
          if (error?.status === 0) {
            console.log('[API] Server appears to be unreachable, possible restart or CORS issue');
          }
        }
      })
    );
  }

  // User Management Methods
  getCurrentUser(): Observable<UserDto> {
    return this.http.get<UserDto>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.currentUser)
    );
  }

  getAllUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.users)
    );
  }

  getUserById(id: string): Observable<UserDto> {
    return this.http.get<UserDto>(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.userById, {id})
      )
    );
  }

  addUser(user: ApiUserCreateDto): Observable<UserDto> {
    return this.http.post<UserDto>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.addUser),
      user
    );
  }

  updateUser(id: string, user: ApiUserUpdateDto): Observable<UserDto> {
    return this.http.put<UserDto>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.replaceUrlParams(ApiEndpoints.updateUser, {id})),
      user
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.deleteUser, {id})
      )
    );
  }

  resendConfirmationEmail(userEmail: string): Observable<any> {
    return this.http.post(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.replaceUrlParams(ApiEndpoints.resendConfirmationEmail, {email: userEmail})),
      {}
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
      {id: '', name}
    );
  }

  updateRole(dto: RoleDto): Observable<RoleDto> {
    return this.http.put<RoleDto>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.replaceUrlParams(ApiEndpoints.updateRole, {id: dto.id.toString()})),
      dto
    );
  }

  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.deleteRole, {id: id.toString()})
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
    const url = ApiEndpoints.buildUrl(
      this.baseUrl,
      ApiEndpoints.replaceUrlParams(ApiEndpoints.deleteDbConnection, {id: id.toString()})
    );
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

  getDatabaseEndpoints(id: number, controller: string | null = null, targetTable: string | null = null, action: string | null = null): Observable<DBConnectionEndpointInfoDto[]> {
    return this.http.get<DBConnectionEndpointInfoDto[]>(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(
          ApiEndpoints.dbConnectionEndPoints,
          {
            connectionId: id.toString(),
            controller: controller || '',
            targetTable: targetTable || '',
            action: action || ''
          }
        )
      )
    );
  }

  getControllers(id: number): Observable<DBConnectionControllerInfoDto[]> {
    return this.http.get<DBConnectionControllerInfoDto[]>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.replaceUrlParams(ApiEndpoints.dbConnectionControllers, {id: id.toString()}))
    );
  }

  getEndpoints(id: number): Observable<DBConnectionEndpointRequestInfoDto[]> {
    return this.http.get<DBConnectionEndpointRequestInfoDto[]>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.replaceUrlParams(ApiEndpoints.dbConnectionControllers, {id: id.toString()}))
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
      {dto}
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
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.replaceUrlParams(ApiEndpoints.menuById, {id: id.toString()}))
    );
  }

  createMenu(category: MenuCreateDto): Observable<MenuDto> {
    return this.http.post<MenuDto>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.addMenu),
      category
    ).pipe(
      tap(() => this.menuUpdated.next())
    );
  }

  updateMenu(id: number, menu: MenuDto): Observable<MenuDto> {
    return this.http.put<MenuDto>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.replaceUrlParams(ApiEndpoints.updateMenu, {id: id.toString()})),
      menu
    ).pipe(
      tap(() => this.menuUpdated.next())
    );
  }

  deleteMenu(id: number): Observable<void> {
    return this.http.delete<void>(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.deleteMenu, {id: id.toString()})
      )
    ).pipe(
      tap(() => this.menuUpdated.next())
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
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.replaceUrlParams(ApiEndpoints.pagesByMenuId, {menuId: menuId.toString()}))
    );
  }

  getPage(id: number): Observable<PageDto> {
    return this.http.get<PageDto>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.replaceUrlParams(ApiEndpoints.pageById, {id: id.toString()}))
    );
  }

  createPage(page: Partial<PageCreateDto>): Observable<PageDto> {
    return this.http.post<PageDto>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.pages),
      page
    ).pipe(
      tap(() => this.menuUpdated.next())
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
    ).pipe(
      tap(() => this.menuUpdated.next())
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
    ).pipe(
      tap(() => this.menuUpdated.next())
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
        ApiEndpoints.replaceUrlParams(ApiEndpoints.deleteLayout, {pageId: pageId.toString()})
      )
    );
  }

  // Datasources Methods
  getDatasourceContexts(): Observable<string[]> {
    return this.http.get<string[]>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.datasourcesContexts)
    );
  }

  getDatasourceContextEntities(contextName: string): Observable<DataStructureDefinitionDto[]> {
    return this.http.get<DataStructureDefinitionDto[]>(
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
  ): Observable<DataStructureDefinitionDto> {
    return this.http.get<DataStructureDefinitionDto>(
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
    paginationParameters: DataRequestParametersDto
  ): Observable<ExtendedPaginatedResultDto<any>> {

    return this.http.post<ExtendedPaginatedResultDto<any>>(
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
    SQLQueryCreate: SQLQueryCreateDto
  ): Observable<SQLQueryDto> {

    return this.http.post<SQLQueryDto>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.sqlQueries),
      SQLQueryCreate
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
    queryId: number | string,
    parameters: DataRequestParametersDto
  ): Observable<ExtendedPaginatedResultDto<any>> {
    return this.http.post<ExtendedPaginatedResultDto<any>>(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.executeSqlQuery, {
          id: queryId.toString()
        })
      ),
      {
        pageNumber: parameters.pageNumber,
        pageSize: parameters.pageSize,
        globalSearch: parameters.globalSearch,
        columnSearches: parameters.columnSearches,
        orderBy: parameters.orderBy,
        includes: parameters.includes,
        sqlParameters: {}
      }
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

  setup(
    adminSetup: SetupAdminDto,
    smtpSetup: SetupSmtpDto,
    createSample: boolean,
  ): Observable<boolean> {
    return this.post<boolean>(ApiEndpoints.setup, {
      admin: adminSetup,
      smtp: smtpSetup,
      createSample: createSample
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

  // Méthode pour récupérer les valeurs uniques d'une colonne
  getColumnValues(route: string, columnName: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/${route}/columns/${columnName}/values`);
  }
}
