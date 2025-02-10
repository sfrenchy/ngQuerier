import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl, ValidatorFn } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '@services/api.service';
import { DBConnectionCreateDto, DBConnectionDto, DBConnectionType, ConnectionStringParameterDto } from '@models/api.models';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';
import { SignalRService } from '@services/signalr.service';
import { v4 as uuidv4 } from 'uuid';
import { OperationStatusComponent } from '@shared/components/operation-status/operation-status.component';

interface DBProviderConfig {
  value: number;
  label: string;
  defaultParams: { key: string; isEncrypted: boolean }[];
}

@Component({
  selector: 'app-databases',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    ConfirmationDialogComponent,
    OperationStatusComponent
  ],
  templateUrl: './databases.component.html'
})
export class DatabasesComponent implements OnInit, OnDestroy {
  connections: DBConnectionDto[] = [];
  showDeleteConfirmation = false;
  connectionToDelete: DBConnectionDto | null = null;
  showAddForm = false;
  dbForm!: FormGroup;
  showAdvancedOptions = false;
  operationId?: string;
  progressState?: { progress: number; status: string; error?: string };

  providers: DBProviderConfig[] = [
    {
      value: 0,
      label: 'SQL Server',
      defaultParams: [
        { key: 'Server', isEncrypted: false },
        { key: 'Database', isEncrypted: false },
        { key: 'User Id', isEncrypted: false },
        { key: 'Password', isEncrypted: true },
        { key: 'TrustServerCertificate', isEncrypted: false }
      ]
    },
    {
      value: 1,
      label: 'MySQL',
      defaultParams: [
        { key: 'Server', isEncrypted: false },
        { key: 'Database', isEncrypted: false },
        { key: 'Uid', isEncrypted: false },
        { key: 'Pwd', isEncrypted: true },
        { key: 'Port', isEncrypted: false }
      ]
    },
    {
      value: 2,
      label: 'PostgreSQL',
      defaultParams: [
        { key: 'Host', isEncrypted: false },
        { key: 'Database', isEncrypted: false },
        { key: 'Username', isEncrypted: false },
        { key: 'Password', isEncrypted: true },
        { key: 'Port', isEncrypted: false }
      ]
    },
    {
      value: 3,
      label: 'SQLite',
      defaultParams: [
        { key: 'Data Source', isEncrypted: false },
        { key: 'Version', isEncrypted: false }
      ]
    }
  ];

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private signalRService: SignalRService
  ) {
    this.initForm();
    this.signalRService.operationProgress.subscribe(progress => {
      this.progressState = {
        progress: progress.progress,
        status: `ADD_DB_CONNECTION.PROGRESS.${progress.status}`,
        error: progress.error
      };
    });
  }

  private initForm(): void {
    this.dbForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_]+$'), // Uniquement lettres, chiffres et underscore
        this.noLeadingDigitValidator() // Pas de chiffre en premier caractère
      ]],
      connectionType: ['', [Validators.required]],
      contextApiRoute: ['', [Validators.required]],
      generateProcedureControllersAndServices: [false],
      parameters: this.fb.array([])
    });

    // Réagir aux changements du type de connexion
    this.dbForm.get('connectionType')?.valueChanges.subscribe((type: DBConnectionType) => {
      if (type) {
        this.updateParametersForType(type);
      }
    });
  }

  private updateParametersForType(type: DBConnectionType): void {
    const parameters = this.dbForm.get('parameters') as FormArray;
    const generateProceduresControl = this.dbForm.get('generateProcedureControllersAndServices');

    // Vider les paramètres existants
    while (parameters.length !== 0) {
      parameters.removeAt(0);
    }

    // Mettre à jour generateProcedureControllersAndServices en fonction du type
    if (type !== DBConnectionType.SqlServer) {
      generateProceduresControl?.setValue(false);
    }

    const providerConfig = this.providers.find(p => p.value === Number(type));

    if (providerConfig) {
      providerConfig.defaultParams.forEach(param => {
        this.addParameter(param.key, '', param.isEncrypted);
      });
    }
  }

  get parameters(): FormArray {
    return this.dbForm.get('parameters') as FormArray;
  }

  removeParameter(index: number): void {
    const parameters = this.dbForm.get('parameters') as FormArray;
    parameters.removeAt(index);
  }

  ngOnInit(): void {
    this.loadConnections();
  }

  private loadConnections(): void {
    this.apiService.getDBConnections().subscribe({
      next: (connections: DBConnectionDto[]) => {
        this.connections = connections;
      },
      error: (error: any) => {
        console.error('Error loading connections:', error);
      }
    });
  }

  getProviderLabel(connectionType: DBConnectionType | string): string {
    if (typeof connectionType === 'string') {
      switch (connectionType) {
        case 'SqlServer':
          return 'SQL Server';
        case 'MySQL':
          return 'MySQL';
        case 'PgSQL':
          return 'PostgreSQL';
        case 'SQLite':
          return 'SQLite';
        default:
          return 'Unknown';
      }
    }

    switch (connectionType) {
      case DBConnectionType.SqlServer:
        return 'SQL Server';
      case DBConnectionType.MySQL:
        return 'MySQL';
      case DBConnectionType.PgSQL:
        return 'PostgreSQL';
      case DBConnectionType.SQLite:
        return 'SQLite';
      default:
        return 'Unknown';
    }
  }

  onAddClick(): void {
    this.showAddForm = true;
    this.dbForm.reset({
      generateProcedureControllersAndServices: false
    });
  }

  onDeleteClick(connection: DBConnectionDto): void {
    this.connectionToDelete = connection;
    this.showDeleteConfirmation = true;
  }

  onConfirmDelete(): void {
    if (this.connectionToDelete) {
      this.apiService.deleteDBConnection(this.connectionToDelete.id).subscribe({
        next: () => {
          this.loadConnections();
          this.resetDeleteState();
        },
        error: (error: any) => {
          console.error('Error deleting connection:', error);
          this.resetDeleteState();
        }
      });
    }
  }

  onCancelDelete(): void {
    this.resetDeleteState();
  }

  private resetDeleteState(): void {
    this.showDeleteConfirmation = false;
    this.connectionToDelete = null;
  }

  onSubmit(): void {
    if (this.dbForm.valid) {
      const formValue = this.dbForm.value;
      this.operationId = uuidv4();

      const connection: DBConnectionCreateDto = {
        name: formValue.name,
        connectionType: formValue.connectionType,
        parameters: formValue.parameters,
        contextName: formValue.contextApiRoute,
        apiRoute: formValue.contextApiRoute,
        generateProcedureControllersAndServices: formValue.generateProcedureControllersAndServices,
        operationId: this.operationId
      };

      // S'abonner aux mises à jour de progression
      this.signalRService.subscribeToOperation(this.operationId).then(() => {
        this.signalRService.onOperationProgress(this.operationId!).subscribe({
          next: (event) => {
            this.progressState = {
              progress: event.progress,
              status: `ADD_DB_CONNECTION.PROGRESS.${event.status}`,
              error: event.error
            };
          },
          error: (err) => console.error('Progress subscription error:', err)
        });

        // Créer la connexion
        this.apiService.addDBConnection(connection).subscribe({
          next: () => {
            this.loadConnections();
            this.resetForm();
          },
          error: (error: any) => {
            console.error('Error creating connection:', error);
          }
        });
      });
    }
  }

  onCancelClick(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.showAddForm = false;
    this.dbForm.reset();
  }

  addParameter(key: string = '', value: string = '', isEncrypted: boolean = false): void {
    const parameters = this.dbForm.get('parameters') as FormArray;
    parameters.push(
      this.fb.group({
        key: [key, Validators.required],
        value: [value, Validators.required],
        isEncrypted: [isEncrypted]
      })
    );
  }

  // Validateur pour empêcher un chiffre en premier caractère
  private noLeadingDigitValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const forbidden = /^[0-9]/.test(control.value);
      return forbidden ? {'noLeadingDigit': {value: control.value}} : null;
    };
  }

  // Getter pour faciliter l'accès aux erreurs dans le template
  get nameErrors() {
    const control = this.dbForm.get('name');
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return 'DATABASES.VALIDATION.NAME_REQUIRED';
      }
      if (control.errors['pattern']) {
        return 'DATABASES.VALIDATION.NAME_PATTERN';
      }
      if (control.errors['noLeadingDigit']) {
        return 'DATABASES.VALIDATION.NAME_NO_LEADING_DIGIT';
      }
    }
    return null;
  }

  ngOnDestroy(): void {
    if (this.operationId) {
      this.signalRService.unsubscribeFromOperation(this.operationId)
        .catch(err => console.error('Error unsubscribing:', err));
    }
  }
}
