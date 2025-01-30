export interface ValidationError {
  code: string;
  message: string;
  controlPath?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
