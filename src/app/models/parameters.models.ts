export interface StoredProcedureParameter {
  name: string;
  type: string;
  value: any;
  userChangeAllowed: boolean;
  displayName?: string;
  description?: string;
  dateType?: 'specific' | 'today' | 'yesterday' | 'lastWeek' | 'lastMonth' | 'lastYear';
}

export interface ChartParameters {
  parameters: StoredProcedureParameter[];
  lastUpdate?: Date;
  autoRefreshInterval?: number;  // en secondes
}

export type ParameterType = 'string' | 'number' | 'date' | 'boolean' | 'array';

export interface ParameterValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: any[];
} 