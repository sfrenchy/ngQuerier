import {DataStructureDefinitionDto, DBConnectionControllerInfoDto, DBConnectionDto, SQLQueryDto} from './api.models';
import {StoredProcedureParameter} from './parameters.models';

// Nouvelle interface pour la configuration de la source de données locale
export interface LocalDataTableConfig {
  cardId: number;
  useFilteredData: boolean;
  columns?: string[]; // Colonnes à utiliser depuis la table source
}

export interface ParameterValue {
  value: any;
  dateType?: 'specific' | 'today' | 'yesterday' | 'lastWeek' | 'lastMonth' | 'lastYear';
  userChangeAllowed: boolean;
}

export interface DatasourceConfig {
  type: 'API' | 'EntityFramework' | 'SQLQuery' | 'LocalDataTable';
  connection?: DBConnectionDto;
  controller?: DBConnectionControllerInfoDto;
  context?: string;
  entity?: DataStructureDefinitionDto;
  query?: SQLQueryDto;
  procedureParameters?: Record<string, StoredProcedureParameter>;
  hasUserParameters?: boolean;  // Indique si la source de données a des paramètres modifiables par l'utilisateur
  isStoredProcedure?: boolean; // Indique si la source est une procédure stockée (via API)
  localDataTable?: LocalDataTableConfig; // Nouvelle propriété
}
