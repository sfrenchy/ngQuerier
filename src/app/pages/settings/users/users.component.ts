import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '@services/api.service';
import { UserDto, RoleDto, ApiUserCreateDto, ApiUserUpdateDto } from '@models/api.models';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, ConfirmationDialogComponent],
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {
  users: UserDto[] = [];
  roles: RoleDto[] = [];
  showDeleteConfirmation = false;
  userToDelete: UserDto | null = null;
  showAddForm = false;
  editingUser: UserDto | null = null;
  userForm: FormGroup;
  selectedUsers: UserDto[] = [];
  deleteConfirmationMessage = '';
  deleteConfirmationParams: { name?: string; count?: number } = {};

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      roleIds: [[], [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  private loadUsers(): void {
    this.apiService.getAllUsers().subscribe({
      next: (users: UserDto[]) => {
        this.users = users;
        this.selectedUsers = [];
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
      }
    });
  }

  private loadRoles(): void {
    this.apiService.getAllRoles().subscribe({
      next: (roles: RoleDto[]) => {
        this.roles = roles;
      },
      error: (error: any) => {
        console.error('Error loading roles:', error);
      }
    });
  }

  isSelected(user: UserDto): boolean {
    return this.selectedUsers.some(u => u.id === user.id);
  }

  toggleSelection(user: UserDto): void {
    const index = this.selectedUsers.findIndex(u => u.id === user.id);
    if (index === -1) {
      this.selectedUsers.push(user);
    } else {
      this.selectedUsers.splice(index, 1);
    }
  }

  isAllSelected(): boolean {
    return this.users.length > 0 && this.selectedUsers.length === this.users.length;
  }

  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedUsers = [];
    } else {
      this.selectedUsers = [...this.users];
    }
  }

  onDeleteSelectedClick(): void {
    this.userToDelete = null;
    this.deleteConfirmationMessage = 'COMMON.CONFIRMATION.DELETE_MULTIPLE_USERS';
    this.deleteConfirmationParams = { count: this.selectedUsers.length };
    this.showDeleteConfirmation = true;
  }

  onAddClick(): void {
    this.showAddForm = true;
    this.editingUser = null;
    this.userForm.reset();
  }

  onEditClick(user: UserDto): void {
    this.editingUser = user;
    this.showAddForm = true;
    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roleIds: user.roles.map((r: RoleDto) => r.id)
    });
  }

  onDeleteClick(user: UserDto): void {
    this.userToDelete = user;
    this.deleteConfirmationMessage = 'COMMON.CONFIRMATION.DELETE_USER';
    this.deleteConfirmationParams = { name: user.firstName + ' ' + user.lastName };
    this.showDeleteConfirmation = true;
  }

  onConfirmDelete(): void {
    if (this.userToDelete) {
      this.apiService.deleteUser(this.userToDelete.id).subscribe({
        next: () => {
          this.loadUsers();
          this.resetDeleteState();
        },
        error: (error: any) => {
          console.error('Error deleting user:', error);
          this.resetDeleteState();
        }
      });
    } else if (this.selectedUsers.length > 0) {
      // Delete multiple users
      const deletePromises = this.selectedUsers.map(user =>
        this.apiService.deleteUser(user.id).toPromise()
      );

      Promise.all(deletePromises)
        .then(() => {
          this.loadUsers();
          this.resetDeleteState();
        })
        .catch(error => {
          console.error('Error deleting users:', error);
          this.resetDeleteState();
        });
    }
  }

  onCancelDelete(): void {
    this.resetDeleteState();
  }

  private resetDeleteState(): void {
    this.showDeleteConfirmation = false;
    this.userToDelete = null;
    this.deleteConfirmationMessage = '';
    this.deleteConfirmationParams = {};
  }

  private getRoleNameById(roleId: number): string {
    const role = this.roles.find(r => r.id === roleId);
    return role?.name || '';
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const email = this.userForm.get('email')?.value;
      const roleIds = this.userForm.get('roleIds')?.value as number[];
      const roles: RoleDto[] = roleIds.map((id) => {return {id:id, name: this.getRoleNameById(id)}});

      const userUpdateData: ApiUserUpdateDto = {
        id: this.editingUser?.id || '',
        email: email,
        firstName: this.userForm.get('firstName')?.value,
        lastName: this.userForm.get('lastName')?.value,
        roles: roles
      };

      const userCreateData: ApiUserCreateDto = {
        email: email,
        firstName: this.userForm.get('firstName')?.value,
        lastName: this.userForm.get('lastName')?.value,
        roles: roles
      };


      if (this.editingUser) {
        // Update existing user
        this.apiService.updateUser(this.editingUser.id, userUpdateData).subscribe({
          next: () => {
            this.loadUsers();
            this.resetForm();
          },
          error: (error: any) => {
            console.error('Error updating user:', error);
          }
        });
      } else {
        // Create new user
        this.apiService.addUser(userCreateData).subscribe({
          next: () => {
            this.loadUsers();
            this.resetForm();
          },
          error: (error: any) => {
            console.error('Error creating user:', error);
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
    this.editingUser = null;
    this.userForm.reset();
  }

  onRoleChange(event: Event, roleId: number): void {
    const checkbox = event.target as HTMLInputElement;
    const currentRoles = this.userForm.get('roleIds')?.value as number[] || [];
    
    if (checkbox.checked) {
      // Ajouter le rôle s'il n'existe pas déjà
      if (!currentRoles.includes(roleId)) {
        this.userForm.patchValue({
          roleIds: [...currentRoles, roleId]
        });
      }
    } else {
      // Retirer le rôle
      this.userForm.patchValue({
        roleIds: currentRoles.filter(id => id !== roleId)
      });
    }
  }

  isRoleSelected(roleId: number): boolean {
    const currentRoles = this.userForm.get('roleIds')?.value as number[] || [];
    return currentRoles.includes(roleId);
  }

  onResendConfirmation(user: UserDto): void {
    this.apiService.resendConfirmationEmail(user.email).subscribe({
      next: () => {
      },
      error: (error: any) => {
        console.error('Error sending confirmation email:', error);
      }
    });
  }
} 