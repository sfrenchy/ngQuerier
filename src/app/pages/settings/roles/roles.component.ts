import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '@services/api.service';
import { RoleDto } from '@models/api.models';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, ConfirmationDialogComponent],
  templateUrl: './roles.component.html'
})
export class RolesComponent implements OnInit {
  roles: RoleDto[] = [];
  showDeleteConfirmation = false;
  roleToDelete: RoleDto | null = null;
  showAddForm = false;
  editingRole: RoleDto | null = null;
  roleForm: FormGroup;
  selectedRoles: RoleDto[] = [];
  deleteConfirmationMessage = '';
  deleteConfirmationParams: { name?: string; count?: number } = {};

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  private loadRoles(): void {
    this.apiService.getAllRoles().subscribe({
      next: (roles: RoleDto[]) => {
        this.roles = roles;
        this.selectedRoles = [];
      },
      error: (error: any) => {
        console.error('Error loading roles:', error);
      }
    });
  }

  isSelected(role: RoleDto): boolean {
    return this.selectedRoles.some(r => r.id === role.id);
  }

  toggleSelection(role: RoleDto): void {
    const index = this.selectedRoles.findIndex(r => r.id === role.id);
    if (index === -1) {
      this.selectedRoles.push(role);
    } else {
      this.selectedRoles.splice(index, 1);
    }
  }

  isAllSelected(): boolean {
    return this.roles.length > 0 && this.selectedRoles.length === this.roles.length;
  }

  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedRoles = [];
    } else {
      this.selectedRoles = [...this.roles];
    }
  }

  onDeleteSelectedClick(): void {
    this.roleToDelete = null;
    this.deleteConfirmationMessage = 'COMMON.CONFIRMATION.DELETE_MULTIPLE_ROLES';
    this.deleteConfirmationParams = { count: this.selectedRoles.length };
    this.showDeleteConfirmation = true;
  }

  onAddClick(): void {
    this.showAddForm = true;
    this.editingRole = null;
    this.roleForm.reset();
  }

  onEditClick(role: RoleDto): void {
    this.editingRole = role;
    this.showAddForm = true;
    this.roleForm.patchValue({
      name: role.name
    });
  }

  onDeleteClick(role: RoleDto): void {
    this.roleToDelete = role;
    this.showDeleteConfirmation = true;
  }

  onConfirmDelete(): void {
    if (this.roleToDelete) {
      this.apiService.deleteRole(this.roleToDelete.id).subscribe({
        next: () => {
          this.loadRoles();
          this.resetDeleteState();
        },
        error: (error: any) => {
          console.error('Error deleting role:', error);
          this.resetDeleteState();
        }
      });
    } else if (this.selectedRoles.length > 0) {
      // Delete multiple roles
      const deletePromises = this.selectedRoles.map(role =>
        this.apiService.deleteRole(role.id).toPromise()
      );

      Promise.all(deletePromises)
        .then(() => {
          this.loadRoles();
          this.resetDeleteState();
        })
        .catch(error => {
          console.error('Error deleting roles:', error);
          this.resetDeleteState();
        });
    }
  }

  onCancelDelete(): void {
    this.resetDeleteState();
  }

  private resetDeleteState(): void {
    this.showDeleteConfirmation = false;
    this.roleToDelete = null;
    this.deleteConfirmationMessage = '';
    this.deleteConfirmationParams = {};
  }

  onSubmit(): void {
    if (this.roleForm.valid) {
      const roleName = this.roleForm.get('name')?.value;

      if (this.editingRole) {
        // Update existing role
        this.apiService.updateRole({ id: this.editingRole.id, name: roleName }).subscribe({
          next: () => {
            this.loadRoles();
            this.resetForm();
          },
          error: (error: any) => {
            console.error('Error updating role:', error);
          }
        });
      } else {
        // Create new role
        this.apiService.addRole(roleName).subscribe({
          next: () => {
            this.loadRoles();
            this.resetForm();
          },
          error: (error: any) => {
            console.error('Error creating role:', error);
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
    this.editingRole = null;
    this.roleForm.reset();
  }
} 