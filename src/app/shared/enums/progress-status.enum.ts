export enum ProgressStatus {
  Starting = 'Starting',
  ValidatingConnection = 'ValidatingConnection',
  ConnectionValidated = 'ConnectionValidated',
  RetrievingSchema = 'RetrievingSchema',
  SchemaRetrieved = 'SchemaRetrieved',
  GeneratingControllers = 'GeneratingControllers',
  GeneratingEntities = 'GeneratingEntities',
  ControllersGenerated = 'ControllersGenerated',
  Compiling = 'Compiling',
  CompilationSucceeded = 'CompilationSucceeded',
  LoadingAssembly = 'LoadingAssembly',
  Completed = 'Completed',
  Failed = 'Failed'
}
