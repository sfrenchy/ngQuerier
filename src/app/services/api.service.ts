import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiEndpoints } from './api-endpoints';
import {
  User,
  Role,
  DBConnection,
  MenuCategory,
  MenuPage,
  DynamicRow,
  DynamicCard,
  Layout,
  EntitySchema,
  SQLQuery,
  SQLQueryRequest,
  QueryAnalysis,
  ApiConfiguration,
  UserCreateUpdate
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl: string = '';

  constructor(private http: HttpClient) {}

  setBaseUrl(url: string): void {
    this.baseUrl = url;
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

  delete<T>(endpoint: string): Observable<T> {
    const url = ApiEndpoints.buildUrl(this.baseUrl, endpoint);
    return this.http.delete<T>(url);
  }

  // Auth Methods
  signIn(email: string, password: string): Observable<any> {
    return this.http.post(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.signIn),
      { email, password }
    );
  }

  signOut(): Observable<any> {
    return this.http.post(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.signOut),
      {}
    );
  }

  refreshToken(refreshToken: string): Observable<any> {
    return this.http.post(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.refreshToken),
      { refreshToken }
    );
  }

  // Settings Methods
  getSettings(): Observable<any> {
    return this.http.get(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.getSettings)
    );
  }

  updateSettings(settings: any): Observable<any> {
    return this.http.post(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.updateSettings),
      settings
    );
  }

  checkApiStatus(): Observable<void> {
    return this.http.get<void>(`${this.baseUrl}/health`);
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

  addUser(user: UserCreateUpdate): Observable<User> {
    return this.http.put<User>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.addUser),
      user
    );
  }

  updateUser(id: string, user: UserCreateUpdate): Observable<User> {
    return this.http.put<User>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.updateUser),
      { ...user, id }
    );
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.deleteUser, { id })
      )
    );
  }

  resendConfirmationEmail(userId: string): Observable<any> {
    return this.http.post(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.resendConfirmationEmail),
      { userId }
    );
  }

  // Role Methods
  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.roles)
    );
  }

  addRole(name: string): Observable<Role> {
    return this.http.post<Role>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.addRole),
      { id: '', name }
    );
  }

  updateRole(id: string, name: string): Observable<Role> {
    return this.http.post<Role>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.updateRole),
      { id, name }
    );
  }

  deleteRole(id: string): Observable<any> {
    return this.http.delete(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.deleteRole, { id })
      )
    );
  }

  // DB Connection Methods
  getDBConnections(): Observable<DBConnection[]> {
    return this.http.get<DBConnection[]>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.dbConnections)
    );
  }

  getDatabaseSchema(connectionId: number): Observable<any> {
    return this.http.get(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.dbConnectionSchema, {
          connectionId: connectionId.toString()
        })
      )
    );
  }

  analyzeQuery(connectionId: number, query: string): Observable<QueryAnalysis> {
    return this.http.post<QueryAnalysis>(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.analyzeQuery, {
          connectionId: connectionId.toString()
        })
      ),
      { query }
    );
  }

  // Menu Category Methods
  getMenuCategories(): Observable<MenuCategory[]> {
    return this.http.get<MenuCategory[]>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.menuCategories)
    );
  }

  createMenuCategory(category: Partial<MenuCategory>): Observable<MenuCategory> {
    return this.http.post<MenuCategory>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.menuCategories),
      category
    );
  }

  updateMenuCategory(id: number, category: Partial<MenuCategory>): Observable<MenuCategory> {
    return this.http.put<MenuCategory>(
      `${ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.menuCategories)}/${id}`,
      category
    );
  }

  deleteMenuCategory(id: number): Observable<any> {
    return this.http.delete(
      `${ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.menuCategories)}/${id}`
    );
  }

  // Page Methods
  getPages(categoryId: number): Observable<MenuPage[]> {
    return this.http.get<MenuPage[]>(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.pagesByCategory, {
          categoryId: categoryId.toString()
        })
      )
    );
  }

  createPage(page: Partial<MenuPage>): Observable<MenuPage> {
    return this.http.post<MenuPage>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.pages),
      page
    );
  }

  updatePage(id: number, page: Partial<MenuPage>): Observable<MenuPage> {
    return this.http.put<MenuPage>(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.pageById, {
          id: id.toString()
        })
      ),
      page
    );
  }

  deletePage(id: number): Observable<any> {
    return this.http.delete(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.pageById, {
          id: id.toString()
        })
      )
    );
  }

  // Layout Methods
  getLayout(pageId: number): Observable<Layout> {
    return this.http.get<Layout>(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.getLayout, {
          pageId: pageId.toString()
        })
      )
    );
  }

  updateLayout(pageId: number, layout: Layout): Observable<Layout> {
    return this.http.put<Layout>(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.updateLayout, {
          pageId: pageId.toString()
        })
      ),
      layout
    );
  }

  // Entity CRUD Methods
  getEntityContexts(): Observable<string[]> {
    return this.http.get<string[]>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.entityCRUD)
    );
  }

  getEntities(contextTypeName: string): Observable<EntitySchema[]> {
    return this.http.get<EntitySchema[]>(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.entityCRUDEntities, {
          contextTypeName
        })
      )
    );
  }

  getEntityData(
    contextTypeName: string,
    entityTypeName: string,
    pageNumber: number = 1,
    pageSize: number = 10,
    orderBy: string = ''
  ): Observable<{ items: any[]; total: number }> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('orderBy', orderBy);

    return this.http.get<{ items: any[]; total: number }>(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.entityCRUDGetAll, {
          contextTypeName,
          entityTypeName
        })
      ),
      { params }
    );
  }

  // SQL Query Methods
  getSQLQueries(): Observable<SQLQuery[]> {
    return this.http.get<SQLQuery[]>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.sqlQueries)
    );
  }

  getSQLQuery(id: number): Observable<SQLQuery> {
    return this.http.get<SQLQuery>(
      ApiEndpoints.buildUrl(
        this.baseUrl,
        ApiEndpoints.replaceUrlParams(ApiEndpoints.sqlQuery, {
          id: id.toString()
        })
      )
    );
  }

  createSQLQuery(
    query: SQLQuery,
    sampleParameters?: { [key: string]: any }
  ): Observable<SQLQuery> {
    const request: SQLQueryRequest = {
      query,
      sampleParameters
    };

    return this.http.post<SQLQuery>(
      ApiEndpoints.buildUrl(this.baseUrl, ApiEndpoints.sqlQueries),
      request
    );
  }

  updateSQLQuery(
    id: number,
    query: SQLQuery,
    sampleParameters?: { [key: string]: any }
  ): Observable<SQLQuery> {
    const request: SQLQueryRequest = {
      query,
      sampleParameters
    };

    return this.http.put<SQLQuery>(
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
    return this.http.post<void>(`${this.baseUrl}/settings/api-configuration`, config);
  }
} 