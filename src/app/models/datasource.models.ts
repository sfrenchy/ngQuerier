import { DBConnectionDto, DBConnectionControllerInfoDto, DataStructureDefinitionDto, SQLQueryDto } from './api.models';
import { StoredProcedureParameter } from './parameters.models';

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
  procedureParameters?: Record<string, StoredProcedureParameter>;
  hasUserParameters?: boolean;  // Indique si la source de données a des paramètres modifiables par l'utilisateur
  isStoredProcedure?: boolean; // Indique si la source est une procédure stockée (via API)
} 