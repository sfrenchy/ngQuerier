export class ApiEndpoints {
  // Auth Management Controller
  static readonly signIn = 'authmanagement/signin';
  static readonly signOut = 'authmanagement/signout';
  static readonly refreshToken = 'authmanagement/refreshtoken';

  // Settings Controller
  static readonly getSettings = 'settings';
  static readonly updateSettings = 'settings';
  static readonly isConfigured = 'settings/configured';
  static readonly configure = 'settings/configure';
  static readonly apiConfiguration = 'settings/api-configuration';
  static readonly updateApiConfiguration = 'settings/api-configuration';

  // User Management Controller
  static readonly users = 'usermanagement/getall';
  static readonly addUser = 'usermanagement/add';
  static readonly updateUser = 'usermanagement/update';
  static readonly currentUser = 'usermanagement/me';
  static readonly userById = 'users/{id}';
  static readonly deleteUser = 'usermanagement/delete/{id}';
  static readonly userProfile = 'usermanagement/view/{id}';
  static readonly resendConfirmationEmail = 'usermanagement/resend-confirmation';

  // Role Controller
  static readonly roles = 'role/getall';
  static readonly roleById = 'role/{id}';
  static readonly addRole = 'role/addrole';
  static readonly updateRole = 'role/updaterole';
  static readonly deleteRole = 'role/deleterole/{id}';

  // DB Connection Controller
  static readonly dbConnections = 'dbconnection';
  static readonly deleteDbConnection = 'dbconnection/deletedbconnection';
  static readonly addDbConnection = 'dbconnection/adddbconnection';
  static readonly updateDbConnection = 'dbconnection/{id}';
  static readonly dbConnectionSchema = 'dbconnection/{connectionId}/schema';
  static readonly dbConnectionControllers = 'dbconnection/{id}/controllers';
  static readonly analyzeQuery = 'dbconnection/{connectionId}/analyze-query';

  // Menu Category Controller
  static readonly menuCategories = 'dynamicmenucategory';

  // DynamicPage Controller
  static readonly pages = 'dynamicpage';
  static readonly pageById = 'dynamicpage/{id}';
  static readonly pagesByCategory = 'dynamicpage?categoryId={categoryId}';
  static readonly pageLayout = 'dynamicpage/{id}/layout';

  // Dynamic Row Controller
  static readonly dynamicRows = 'dynamicrow';
  static readonly dynamicRowsByPage = 'dynamicrow/page/{pageId}';
  static readonly dynamicRowReorder = 'dynamicrow/page/{pageId}/reorder';

  // Dynamic Card Controller
  static readonly dynamicCards = 'dynamiccard';
  static readonly dynamicCardsByRow = 'dynamiccard/row/{rowId}';
  static readonly dynamicCardReorder = 'dynamiccard/row/{rowId}/reorder';

  // Query Analytics Controller
  static readonly recentQueries = 'queries/recent';
  static readonly queryStats = 'queries/stats';
  static readonly activity = 'queries/activity';

  // Wizard endpoints
  static readonly setup = 'wizard/setup';

  // Layout Controller
  static readonly getLayout = 'layout/{pageId}';
  static readonly updateLayout = 'layout/{pageId}';
  static readonly deleteLayout = 'layout/{pageId}';

  // Entity CRUD endpoints
  static readonly entityCRUD = 'EntityCRUD/GetContexts';
  static readonly entityCRUDEntities = 'EntityCRUD/GetEntities?contextTypeName={contextTypeName}';
  static readonly entityCRUDGetAll = 'EntityCRUD/GetAll?contextTypeName={contextTypeName}&entityTypeName={entityTypeName}';
  static readonly entityCRUDGetEntity = 'EntityCRUD/GetEntity?contextTypeName={contextTypeName}&entityName={entityName}';

  // SQL Query endpoints
  static readonly sqlQueries = 'SQLQuery';
  static readonly sqlQuery = 'SQLQuery/{id}';
  static readonly executeSqlQuery = 'SQLQuery/{id}/execute';

  // SMTP Controller
  static readonly smtpTest = 'smtp/test';

  // Helper Methods
  static buildUrl(baseUrl: string, endpoint: string): string {
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${cleanBaseUrl}/${cleanEndpoint}`;
  }

  static replaceUrlParams(endpoint: string, params: { [key: string]: string }): string {
    let result = endpoint;
    Object.entries(params).forEach(([key, value]) => {
      result = result.replace(`{${key}}`, value);
    });
    return result;
  }
} 