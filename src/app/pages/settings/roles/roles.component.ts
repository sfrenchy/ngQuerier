import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '@services/api.service';
import { Role } from '@models/api.models';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, ConfirmationDialogComponent],
  template: `
    <div class="p-6">
      <div class="bg-gray-800 rounded-lg shadow-lg text-gray-100">
        <div class="p-6 border-b border-gray-700">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-semibold">{{ 'ROLES.TITLE' | translate }}</h2>
            <button
              (click)="onAddClick()"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <i class="fas fa-plus"></i>
              {{ 'ROLES.ADD' | translate }}
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <div class="space-y-4">
            <div *ngIf="showAddForm" class="bg-gray-700 rounded-lg p-6 mb-4">
              <form [formGroup]="roleForm" (ngSubmit)="onSubmit()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-2">
                    {{ 'ROLES.NAME' | translate }}
                  </label>
                  <input
                    type="text"
                    formControlName="name"
                    class="w-full px-3 py-2 bg-gray-900 rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    [placeholder]="'ROLES.NAME' | translate"
                  />
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
                    [disabled]="!roleForm.valid"
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ 'COMMON.SAVE' | translate }}
                  </button>
                </div>
              </form>
            </div>

            <div *ngFor="let role of roles" class="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
              <span class="text-lg">{{ role.Name }}</span>
              <div class="flex items-center gap-3">
                <button
                  (click)="onEditClick(role)"
                  class="text-blue-400 hover:text-blue-300 transition-colors"
                  title="{{ 'COMMON.EDIT' | translate }}"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  (click)="onDeleteClick(role)"
                  class="text-red-400 hover:text-red-300 transition-colors"
                  title="{{ 'COMMON.DELETE' | translate }}"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            
            <div *ngIf="roles.length === 0" class="text-center text-gray-400 py-8">
              {{ 'ROLES.NO_ROLES' | translate }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-confirmation-dialog
      *ngIf="showDeleteConfirmation"
      [messageKey]="'COMMON.CONFIRMATION.DELETE_ROLE'"
      [messageParams]="{ name: roleToDelete?.Name }"
      (confirm)="onConfirmDelete()"
      (cancel)="onCancelDelete()"
    ></app-confirmation-dialog>
  `
})
export class RolesComponent implements OnInit {
  roles: Role[] = [];
  showDeleteConfirmation = false;
  roleToDelete: Role | null = null;
  showAddForm = false;
  editingRole: Role | null = null;
  roleForm: FormGroup;

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
      next: (roles: Role[]) => {
        this.roles = roles;
      },
      error: (error: any) => {
        console.error('Error loading roles:', error);
      }
    });
  }

  onAddClick(): void {
    this.showAddForm = true;
    this.editingRole = null;
    this.roleForm.reset();
  }

  onEditClick(role: Role): void {
    this.editingRole = role;
    this.showAddForm = true;
    this.roleForm.patchValue({
      name: role.Name
    });
  }

  onDeleteClick(role: Role): void {
    this.roleToDelete = role;
    this.showDeleteConfirmation = true;
  }

  onConfirmDelete(): void {
    if (this.roleToDelete) {
      this.apiService.deleteRole(this.roleToDelete.Id).subscribe({
        next: () => {
          this.loadRoles();
          this.resetDeleteState();
        },
        error: (error: any) => {
          console.error('Error deleting role:', error);
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
    this.roleToDelete = null;
  }

  onSubmit(): void {
    if (this.roleForm.valid) {
      const roleName = this.roleForm.get('name')?.value;

      if (this.editingRole) {
        // Update existing role
        this.apiService.updateRole(this.editingRole.Id, roleName).subscribe({
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