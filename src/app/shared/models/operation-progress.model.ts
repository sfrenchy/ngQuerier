export interface OperationProgress {
  operationId: string;
  progress: number;
  status: string;
  error?: string;
  timestamp: Date;
} 