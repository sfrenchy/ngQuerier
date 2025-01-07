import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '@services/api.service';
import { DBConnection, QDBConnectionType } from '@models/api.models';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-databases',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, ConfirmationDialogComponent],
  templateUrl: './databases.component.html'
})
export class DatabasesComponent implements OnInit {
  connections: DBConnection[] = [];
  showDeleteConfirmation = false;
  connectionToDelete: DBConnection | null = null;
  showAddForm = false;
  dbForm: FormGroup;
  providers = [
    { value: QDBConnectionType.SqlServer, label: 'SQL Server' },
    { value: QDBConnectionType.MySQL, label: 'MySQL' },
    { value: QDBConnectionType.PgSQL, label: 'PostgreSQL' }
  ];

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.dbForm = this.fb.group({
      name: ['', [Validators.required]],
      connectionType: ['', [Validators.required]],
      connectionString: ['', [Validators.required]],
      contextApiRoute: ['', [Validators.required]],
      generateProcedureControllersAndServices: [false]
    });
  }

  ngOnInit(): void {
    this.loadConnections();
  }

  private loadConnections(): void {
    this.apiService.getDBConnections().subscribe({
      next: (connections: DBConnection[]) => {
        this.connections = connections;
      },
      error: (error: any) => {
        console.error('Error loading connections:', error);
      }
    });
  }

  getProviderLabel(connectionType: QDBConnectionType | string): string {
    if (typeof connectionType === 'string') {
      switch (connectionType) {
        case 'SqlServer':
          return 'SQL Server';
        case 'MySQL':
          return 'MySQL';
        case 'PgSQL':
          return 'PostgreSQL';
        default:
          return 'Unknown';
      }
    }

    switch (connectionType) {
      case QDBConnectionType.SqlServer:
        return 'SQL Server';
      case QDBConnectionType.MySQL:
        return 'MySQL';
      case QDBConnectionType.PgSQL:
        return 'PostgreSQL';
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

  onDeleteClick(connection: DBConnection): void {
    this.connectionToDelete = connection;
    this.showDeleteConfirmation = true;
  }

  onConfirmDelete(): void {
    if (this.connectionToDelete) {
      this.apiService.deleteDBConnection(this.connectionToDelete.Id).subscribe({
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
      const connection: DBConnection = {
        Id: 0,
        Name: formValue.name,
        ConnectionType: formValue.connectionType,
        ConnectionString: formValue.connectionString,
        ApiRoute: formValue.contextApiRoute,
        GenerateProcedureControllersAndServices: formValue.generateProcedureControllersAndServices
      };

      this.apiService.addDBConnection(connection).subscribe({
        next: () => {
          this.loadConnections();
          this.resetForm();
        },
        error: (error: any) => {
          console.error('Error creating connection:', error);
        }
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
} 