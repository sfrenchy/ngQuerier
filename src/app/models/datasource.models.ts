import { DBConnectionDto, DBConnectionControllerInfoDto, DataStructureDefinitionDto, SQLQueryDto } from './api.models';

export interface ParameterValue {
  value: any;
  dateType?: 'specific' | 'today' | 'yesterday' | 'lastWeek' | 'lastMonth' | 'lastYear';
  userChangeAllowed: boolean;
}

export interface DatasourceConfig {
  type: 'API' | 'EntityFramework' | 'SQLQuery';
  connection?: DBConnectionDto;
  controller?: DBConnectionControllerInfoDto;
  context?: string;
  entity?: DataStructureDefinitionDto;
  query?: SQLQueryDto;
  procedureParameters?: Record<string, ParameterValue>;
} 