import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '@services/api.service';
import { DBConnectionCreateDto, DBConnectionDto, DBConnectionType } from '@models/api.models';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-databases',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, ConfirmationDialogComponent],
  templateUrl: './databases.component.html'
})
export class DatabasesComponent implements OnInit {
  connections: DBConnectionDto[] = [];
  showDeleteConfirmation = false;
  connectionToDelete: DBConnectionDto | null = null;
  showAddForm = false;
  dbForm: FormGroup;
  providers = [
    { value: DBConnectionType.SqlServer, label: 'SQL Server' },
    { value: DBConnectionType.MySQL, label: 'MySQL' },
    { value: DBConnectionType.PgSQL, label: 'PostgreSQL' }
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
      const connection: DBConnectionCreateDto = {
        name: formValue.name,
        connectionType: formValue.connectionType,
        connectionString: formValue.connectionString,
        contextApiRoute: formValue.contextApiRoute,
        generateProcedureControllersAndServices: formValue.generateProcedureControllersAndServices
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