import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserService } from '@services/user.service';
import { ApiService } from '@services/api.service';
import { IconPickerComponent } from '@shared/components/icon-picker/icon-picker.component';

@Component({
  selector: 'app-menu-form',
  templateUrl: './menu-form.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, IconPickerComponent]
})
export class MenuFormComponent implements OnInit {
  menuForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  isEditMode = false;
  categoryId: number | null = null;
  supportedLanguages = ['fr', 'en'];
  availableRoles: string[] = [];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {
    this.menuForm = this.fb.group({
      Names: this.fb.group({
        fr: ['', Validators.required],
        en: ['', Validators.required]
      }),
      Icon: ['', Validators.required],
      Order: [0, Validators.required],
      IsVisible: [true],
      Roles: [[]],
      Route: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.categoryId = +id;
      this.loadCategory(this.categoryId);
    }
  }

  loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (roles) => {
        this.availableRoles = roles.map(role => role.name);
      },
      error: (error) => {
        this.error = error.message;
      }
    });
  }

  loadCategory(id: number): void {
    this.isLoading = true;
    this.apiService.getMenu(id).subscribe({
      next: (menu) => {
        this.menuForm.patchValue({
          Names: menu.names,
          Icon: menu.icon,
          Order: menu.order,
          IsVisible: menu.isVisible,
          Roles: menu.roles,
          Route: menu.route
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.menuForm.invalid) return;

    this.isLoading = true;
    const formData = this.menuForm.value;

    const saveObservable = this.isEditMode && this.categoryId
      ? this.apiService.updateMenu(this.categoryId, formData)
      : this.apiService.createMenu(formData);

    saveObservable.subscribe({
      next: () => {
        this.router.navigate(['/settings/menu']);
      },
      error: (error) => {
        this.error = error.message;
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/settings/menu']);
  }

  handleRoleChange(role: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const currentRoles = this.menuForm.get('Roles')?.value as string[] || [];
    
    if (checkbox.checked) {
      this.menuForm.get('Roles')?.setValue([...currentRoles, role]);
    } else {
      this.menuForm.get('Roles')?.setValue(currentRoles.filter(r => r !== role));
    }
  }

  isRoleSelected(role: string): boolean {
    const roles = this.menuForm.get('Roles')?.value as string[] || [];
    return roles.includes(role);
  }
}
