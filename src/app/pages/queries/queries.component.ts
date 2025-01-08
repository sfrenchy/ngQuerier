import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '@services/api.service';
import { SQLQuery, DBConnection } from '@models/api.models';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';
import { MonacoEditorModule, NGX_MONACO_EDITOR_CONFIG } from 'ngx-monaco-editor-v2';
import { forkJoin } from 'rxjs';

const monacoConfig = {
  onMonacoLoad: () => {
  }
};

@Component({
  selector: 'app-queries',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, ConfirmationDialogComponent, MonacoEditorModule],
  templateUrl: './queries.component.html',
  providers: [
    {
      provide: NGX_MONACO_EDITOR_CONFIG,
      useValue: monacoConfig
    }
  ]
})
export class QueriesComponent implements OnInit {
  queries: SQLQuery[] = [];
  connections: DBConnection[] = [];
  showDeleteConfirmation = false;
  queryToDelete: SQLQuery | null = null;
  showAddForm = false;
  queryForm: FormGroup;
  editorOptions = {
    theme: 'vs-dark',
    language: 'sql',
    minimap: { enabled: false }
  };

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.queryForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      connectionId: ['', [Validators.required]],
      query: ['', [Validators.required]],
      isPublic: [false],
      parameters: [{}]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    // Charger les connexions et les requêtes en parallèle
    forkJoin({
      queries: this.apiService.getSQLQueries(),
      connections: this.apiService.getDBConnections()
    }).subscribe({
      next: (result) => {
        this.queries = result.queries;
        this.connections = result.connections;
      },
      error: (error: any) => {
        console.error('Error loading data:', error);
      }
    });
  }

  private loadQueries(): void {
    this.apiService.getSQLQueries().subscribe({
      next: (queries: SQLQuery[]) => {
        this.queries = queries;
      },
      error: (error: any) => {
        console.error('Error loading queries:', error);
      }
    });
  }

  getConnectionName(connectionId: number): string {
    const connection = this.connections.find(c => c.Id === connectionId);
    return connection ? connection.Name : 'Unknown';
  }

  onAddClick(): void {
    this.showAddForm = true;
    this.queryForm.reset({
      isPublic: false,
      parameters: {}
    });
  }

  onEditClick(query: SQLQuery): void {
    this.showAddForm = true;
    this.queryForm.patchValue({
      name: query.Name,
      description: query.Description,
      connectionId: query.ConnectionId,
      query: query.Query,
      isPublic: query.IsPublic,
      parameters: query.Parameters || {}
    });
    this.queryToDelete = query;
  }

  onDeleteClick(query: SQLQuery): void {
    this.queryToDelete = query;
    this.showDeleteConfirmation = true;
  }

  onConfirmDelete(): void {
    if (this.queryToDelete) {
      this.apiService.deleteSQLQuery(this.queryToDelete.Id).subscribe({
        next: () => {
          this.loadQueries();
          this.resetDeleteState();
        },
        error: (error: any) => {
          console.error('Error deleting query:', error);
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
    this.queryToDelete = null;
  }

  onSubmit(): void {
    if (this.queryForm.valid) {
      const formValue = this.queryForm.value;
      const query: SQLQuery = {
        Id: this.queryToDelete?.Id || 0,
        Name: formValue.name,
        Description: formValue.description,
        ConnectionId: formValue.connectionId,
        Query: formValue.query,
        IsPublic: formValue.isPublic,
        Parameters: formValue.parameters
      };

      if (this.queryToDelete) {
        // Update existing query
        this.apiService.updateSQLQuery(this.queryToDelete.Id, query).subscribe({
          next: () => {
            this.loadQueries();
            this.resetForm();
          },
          error: (error: any) => {
            console.error('Error updating query:', error);
          }
        });
      } else {
        // Create new query
        this.apiService.createSQLQuery(query).subscribe({
          next: () => {
            this.loadQueries();
            this.resetForm();
          },
          error: (error: any) => {
            console.error('Error creating query:', error);
          }
        });
      }
    }
  }

  onCancelClick(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.showAddForm = false;
    this.queryForm.reset();
    this.queryToDelete = null;
  }
}
