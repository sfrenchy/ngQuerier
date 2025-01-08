import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '@services/api.service';
import { User, Role, UserCreateUpdate } from '@models/api.models';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, ConfirmationDialogComponent],
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [];
  showDeleteConfirmation = false;
  userToDelete: User | null = null;
  showAddForm = false;
  editingUser: User | null = null;
  userForm: FormGroup;

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
      next: (users: User[]) => {
        this.users = users;
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
      }
    });
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
    this.editingUser = null;
    this.userForm.reset();
  }

  onEditClick(user: User): void {
    this.editingUser = user;
    this.showAddForm = true;
    this.userForm.patchValue({
      firstName: user.FirstName,
      lastName: user.LastName,
      email: user.Email,
      roleIds: user.Roles.map(r => typeof r === 'string' ? r : r.Id)
    });
  }

  onDeleteClick(user: User): void {
    this.userToDelete = user;
    this.showDeleteConfirmation = true;
  }

  onConfirmDelete(): void {
    if (this.userToDelete) {
      this.apiService.deleteUser(this.userToDelete.Id).subscribe({
        next: () => {
          this.loadUsers();
          this.resetDeleteState();
        },
        error: (error: any) => {
          console.error('Error deleting user:', error);
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
    this.userToDelete = null;
  }

  private getRoleNameById(roleId: string): string | undefined {
    const role = this.roles.find(r => r.Id === roleId);
    return role?.Name;
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const email = this.userForm.get('email')?.value;
      const roleIds = this.userForm.get('roleIds')?.value as string[];
      const roleNames = roleIds.map(id => this.getRoleNameById(id)).filter((name): name is string => name !== undefined);

      const userData: UserCreateUpdate = {
        id: this.editingUser?.Id || '',
        email: email,
        firstName: this.userForm.get('firstName')?.value,
        lastName: this.userForm.get('lastName')?.value,
        userName: email,
        roles: roleNames
      };

      if (this.editingUser) {
        // Update existing user
        this.apiService.updateUser(this.editingUser.Id, userData).subscribe({
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
        this.apiService.addUser(userData).subscribe({
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

  onRoleChange(event: Event, roleId: string): void {
    const checkbox = event.target as HTMLInputElement;
    const currentRoles = this.userForm.get('roleIds')?.value as string[] || [];
    
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

  isRoleSelected(roleId: string): boolean {
    const currentRoles = this.userForm.get('roleIds')?.value as string[] || [];
    return currentRoles.includes(roleId);
  }

  onResendConfirmation(user: User): void {
    this.apiService.resendConfirmationEmail(user.Id).subscribe({
      next: () => {
      },
      error: (error: any) => {
        console.error('Error sending confirmation email:', error);
      }
    });
  }
} 