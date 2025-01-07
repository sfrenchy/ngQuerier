export class ApiEndpoints {
  // Existing endpoints...

  // API Configuration
  static apiConfiguration = 'api/v1/Configuration';

  static buildUrl(baseUrl: string, endpoint: string): string {
    return `${baseUrl}/${endpoint}`;
  }

  static replaceUrlParams(url: string, params: { [key: string]: string }): string {
    let result = url;
    for (const key in params) {
      result = result.replace(`{${key}}`, params[key]);
    }
    return result;
  }
} 