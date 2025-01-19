export class ApiEndpoints {
  // Auth Management Controller
  static readonly signIn = 'Authentication/SignIn';
  static readonly signUp = 'Authentication/SignUp';
  static readonly refreshToken = 'Authentication/RefreshToken';
  static readonly signOut = 'Authentication/SignOut';

  // Settings Controller
  static readonly getSettings = 'Settings';
  static readonly updateSettings = 'Settings';
  static readonly isConfigured = 'PublicSettings/configured';
  static readonly apiConfiguration = 'Settings/api-configuration';
  static readonly updateApiConfiguration = 'Settings/api-configuration';

  // User Management Controller
  static readonly users = 'user';
  static readonly addUser = 'user';
  static readonly updateUser = 'user/{id}';
  static readonly currentUser = 'user/me';
  static readonly userById = 'user/{id}';
  static readonly deleteUser = 'user/{id}';
  static readonly userProfile = 'user/view/{id}';
  static readonly resendConfirmationEmail = 'user/resend-confirmation?email={email}';

  // Role Controller
  static readonly roles = 'role';
  static readonly roleById = 'role/{id}';
  static readonly addRole = 'role';
  static readonly updateRole = 'role/{id}';
  static readonly deleteRole = 'role/{id}';

  // DB Connection Controller
  static readonly dbConnections = 'dbconnection';
  static readonly deleteDbConnection = 'dbconnection/{id}';
  static readonly addDbConnection = 'dbconnection';
  static readonly dbConnectionSchema = 'dbconnection/{id}/schema';
  static readonly dbConnectionControllers = 'dbconnection/{id}/controllers';
  static readonly analyzeQuery = 'dbconnection/{connectionId}/analyze-query';
  static readonly dbConnectionEndPoints = 'dbconnection/{connectionId}/endPoints';

  // Menu Controller
  static readonly menus = 'menu';
  static readonly menuById = 'menu/{id}';
  static readonly addMenu = 'menu';
  static readonly updateMenu = 'menu/{id}';
  static readonly deleteMenu = 'menu/{id}';

  // Page Controller
  static readonly pages = 'page';
  static readonly pagesByMenuId = 'page/menu/{menuId}';
  static readonly pageById = 'page/{id}';
  static readonly addPage = 'page';
  static readonly updatePage = 'page/{id}';
  static readonly deletePage = 'page/{id}';


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

  // Datasources endpoints
  static readonly datasourcesContexts = 'datasources/contexts';
  static readonly datasourceContextEntities = 'datasources/contexts/{contextName}/entities';
  static readonly datasourceContextEntity = 'datasources/contexts/{contextName}/entities/{entityName}';
  static readonly datasourceContextEntityRecords = 'datasources/contexts/{contextName}/entities/{entityName}/records';

  // SQL Query endpoints
  static readonly sqlQueries = 'SqlQuery';
  static readonly sqlQuery = 'SqlQuery/{id}';
  static readonly executeSqlQuery = 'SqlQuery/{id}/execute';

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