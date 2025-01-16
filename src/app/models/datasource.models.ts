import { DBConnectionDto, DBConnectionControllerInfoDto, EntityDefinitionDto, SQLQueryDto } from './api.models';

export interface DatasourceConfig {
  type: 'API' | 'EntityFramework' | 'SQLQuery';
  connection?: DBConnectionDto;
  controller?: DBConnectionControllerInfoDto;
  context?: string;
  entity?: EntityDefinitionDto;
  query?: SQLQueryDto;
} 