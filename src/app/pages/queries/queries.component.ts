import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '@services/api.service';
import { UserService } from '@services/user.service';
import { SQLQueryDto, DBConnectionDto, SQLQueryCreateDto, UserDto } from '@models/api.models';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';
import { MonacoEditorModule, NGX_MONACO_EDITOR_CONFIG } from 'ngx-monaco-editor-v2';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

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
  queries: SQLQueryDto[] = [];
  connections: DBConnectionDto[] = [];
  showDeleteConfirmation = false;
  queryToDelete: SQLQueryDto | null = null;
  showAddForm = false;
  queryForm: FormGroup;
  editorOptions = {
    theme: 'vs-dark',
    language: 'sql',
    minimap: { enabled: false }
  };
  private userCache: Map<string, UserDto> = new Map();

  constructor(
    private apiService: ApiService,
    private userService: UserService,
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
        // Si l'utilisateur est admin ou database manager, on affiche toutes les queries
        // Sinon on filtre pour n'afficher que les queries publiques et celles créées par l'utilisateur
        if (this.userService.hasAnyRole(['Admin', 'Database Manager'])) {
          this.queries = result.queries;
        } else {
          const currentUser = this.userService.getCurrentUser();
          this.queries = result.queries.filter(q => q.isPublic || q.createdBy === currentUser?.id);
        }
        this.connections = result.connections;
      },
      error: (error: any) => {
        console.error('Error loading data:', error);
      }
    });
  }

  private loadQueries(): void {
    this.apiService.getSQLQueries().subscribe({
      next: (queries: SQLQueryDto[]) => {
        // Même logique de filtrage que dans loadData
        if (this.userService.hasAnyRole(['Admin', 'Database Manager'])) {
          this.queries = queries;
        } else {
          const currentUser = this.userService.getCurrentUser();
          this.queries = queries.filter(q => q.isPublic || q.createdBy === currentUser?.id);
        }
      },
      error: (error: any) => {
        console.error('Error loading queries:', error);
      }
    });
  }

  getConnectionName(connectionId: number): string {
    const connection = this.connections.find(c => c.id === connectionId);
    return connection ? connection.name : 'Unknown';
  }

  onAddClick(): void {
    this.showAddForm = true;
    this.queryForm.reset({
      isPublic: false,
      parameters: {}
    });
  }

  onEditClick(query: SQLQueryDto): void {
    this.showAddForm = true;
    this.queryForm.patchValue({
      name: query.name,
      description: query.description,
      connectionId: query.dbConnectionId,
      query: query.query,
      isPublic: query.isPublic,
      parameters: query.parameters || {}
    });
    this.queryToDelete = query;
  }

  onDeleteClick(query: SQLQueryDto): void {
    this.queryToDelete = query;
    this.showDeleteConfirmation = true;
  }

  onConfirmDelete(): void {
    if (this.queryToDelete) {
      this.apiService.deleteSQLQuery(this.queryToDelete.id).subscribe({
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
      
      const query: SQLQueryDto = {
        id: this.queryToDelete?.id || 0,
        name: formValue.name,
        description: formValue.description,
        dbConnectionId: formValue.connectionId,
        query: formValue.query,
        isPublic: formValue.isPublic,
        parameters: formValue.parameters
      };

      const createQuery: SQLQueryCreateDto = {
        query: query,
        parameters: formValue.parameters
      };

      if (this.queryToDelete) {
        // Update existing query
        this.apiService.updateSQLQuery(this.queryToDelete.id, query).subscribe({
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
        this.apiService.createSQLQuery(createQuery).subscribe({
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
