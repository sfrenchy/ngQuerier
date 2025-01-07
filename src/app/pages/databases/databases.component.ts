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
  template: `
    <div class="p-6">
      <div class="bg-gray-800 rounded-lg shadow-lg text-gray-100">
        <div class="p-6 border-b border-gray-700">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-semibold">{{ 'DATABASES.TITLE' | translate }}</h2>
            <button
              (click)="onAddClick()"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <i class="fas fa-plus"></i>
              {{ 'DATABASES.ADD' | translate }}
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <div class="space-y-4">
            <div *ngIf="showAddForm" class="bg-gray-700 rounded-lg p-6 mb-4">
              <form [formGroup]="dbForm" (ngSubmit)="onSubmit()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-2">
                    {{ 'DATABASES.NAME' | translate }}
                  </label>
                  <input
                    type="text"
                    formControlName="name"
                    class="w-full px-3 py-2 bg-gray-900 rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    [placeholder]="'DATABASES.NAME_PLACEHOLDER' | translate"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2">
                    {{ 'DATABASES.PROVIDER' | translate }}
                  </label>
                  <select
                    formControlName="connectionType"
                    class="w-full px-3 py-2 bg-gray-900 rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">{{ 'DATABASES.SELECT_PROVIDER' | translate }}</option>
                    <option *ngFor="let provider of providers" [value]="provider.value">
                      {{ provider.label }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2">
                    {{ 'DATABASES.CONNECTION_STRING' | translate }}
                  </label>
                  <input
                    type="text"
                    formControlName="connectionString"
                    class="w-full px-3 py-2 bg-gray-900 rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    [placeholder]="'DATABASES.CONNECTION_STRING_PLACEHOLDER' | translate"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2">
                    {{ 'DATABASES.CONTEXT_API_ROUTE' | translate }}
                  </label>
                  <input
                    type="text"
                    formControlName="contextApiRoute"
                    class="w-full px-3 py-2 bg-gray-900 rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    [placeholder]="'DATABASES.CONTEXT_API_ROUTE_PLACEHOLDER' | translate"
                  />
                </div>

                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="generateProcedures"
                    formControlName="generateProcedureControllersAndServices"
                    class="w-4 h-4 text-blue-600 bg-gray-900 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label for="generateProcedures" class="text-sm font-medium">
                    {{ 'DATABASES.GENERATE_PROCEDURES' | translate }}
                  </label>
                </div>
                
                <div class="flex justify-end gap-4">
                  <button
                    type="button"
                    (click)="onCancelClick()"
                    class="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                  >
                    {{ 'COMMON.CANCEL' | translate }}
                  </button>
                  <button
                    type="submit"
                    [disabled]="!dbForm.valid"
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ 'COMMON.SAVE' | translate }}
                  </button>
                </div>
              </form>
            </div>

            <div *ngFor="let connection of connections" class="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="flex flex-col gap-2">
                  <span class="text-lg">{{ connection.Name }}</span>
                  <div class="flex gap-2">
                    <span class="px-2 py-1 text-xs rounded bg-blue-600 text-white">
                      {{ getProviderLabel(connection.ConnectionType) }}
                    </span>
                    <span class="px-2 py-1 text-xs rounded bg-gray-600 text-white">
                      /{{ connection.ApiRoute }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <button
                  (click)="onDeleteClick(connection)"
                  class="text-red-400 hover:text-red-300 transition-colors"
                  title="{{ 'COMMON.DELETE' | translate }}"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            
            <div *ngIf="connections.length === 0" class="text-center text-gray-400 py-8">
              {{ 'DATABASES.NO_CONNECTIONS' | translate }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-confirmation-dialog
      *ngIf="showDeleteConfirmation"
      [messageKey]="'COMMON.CONFIRMATION.DELETE_DATABASE'"
      [messageParams]="{ name: connectionToDelete?.Name }"
      (confirm)="onConfirmDelete()"
      (cancel)="onCancelDelete()"
    ></app-confirmation-dialog>
  `
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