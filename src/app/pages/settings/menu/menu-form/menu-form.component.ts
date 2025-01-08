import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuService } from '@services/menu.service';
import { MenuCategory } from '@models/api.models';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-menu-form',
  templateUrl: './menu-form.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule]
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
    private menuService: MenuService,
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
        this.availableRoles = roles.map(role => role.Name);
      },
      error: (error) => {
        this.error = error.message;
      }
    });
  }

  loadCategory(id: number): void {
    this.isLoading = true;
    this.menuService.getMenuCategory(id).subscribe({
      next: (category) => {
        this.menuForm.patchValue({
          Names: category.Names,
          Icon: category.Icon,
          Order: category.Order,
          IsVisible: category.IsVisible,
          Roles: category.Roles,
          Route: category.Route
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
      ? this.menuService.updateMenuCategory(this.categoryId, formData)
      : this.menuService.createMenuCategory(formData);

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
