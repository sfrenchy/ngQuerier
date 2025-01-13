import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserService } from '@services/user.service';
import { ApiService } from '@services/api.service';
import { RoleDto } from '@models/api.models';
import { IconPickerComponent } from '@shared/components/icon-picker/icon-picker.component';

@Component({
  selector: 'app-page-form',
  templateUrl: './page-form.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, IconPickerComponent]
})
export class PageFormComponent implements OnInit {
  pageForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  isEditMode = false;
  pageId: number | null = null;
  menuId: number | null = null;
  supportedLanguages = ['fr', 'en'];
  availableRoles: RoleDto[] = [];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {
    this.pageForm = this.fb.group({
      title: this.fb.group({
        fr: ['', Validators.required],
        en: ['', Validators.required]
      }),
      icon: ['', Validators.required],
      order: [0, Validators.required],
      isVisible: [true],
      roles: [[]],
      route: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    this.menuId = Number(this.route.snapshot.paramMap.get('categoryId'));
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.pageId = +id;
      this.loadPage(this.pageId);
    }
  }

  loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (roles) => {
        this.availableRoles = roles;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.error = error.message;
      }
    });
  }

  loadPage(id: number): void {
    this.isLoading = true;
    this.apiService.getPage(id).subscribe({
      next: (page) => {
        this.pageForm.patchValue({
          title: page.title,
          icon: page.icon,
          order: page.order,
          isVisible: page.isVisible,
          roles: page.roles,
          route: page.route
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading page:', error);
        this.error = error.message;
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.pageForm.invalid || !this.menuId) return;

    this.isLoading = true;
    const formValue = this.pageForm.value;
    
    // Transformer l'objet names en tableau de traductions
    const titles = Object.entries(formValue.title).map(([lang, text]) => ({
      languageCode: lang,
      value: text as string
    }));

    const formData = {
      ...formValue,
      title: titles,
      roles: formValue.roles.filter((role: any) => 
        typeof role === 'object' && role !== null && 'id' in role && 'name' in role
      ),
      menuId: this.menuId
    };

    const saveObservable = this.isEditMode && this.pageId
      ? this.apiService.updatePage(this.pageId, formData)
      : this.apiService.createPage(formData);

    saveObservable.subscribe({
      next: () => {
        this.router.navigate(['..'], { relativeTo: this.route });
      },
      error: (error) => {
        console.error('Error saving page:', error);
        this.error = error.message;
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  onRoleChange(role: RoleDto, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const currentRoles = this.pageForm.get('roles')?.value as RoleDto[] || [];
    
    if (checkbox.checked) {
      if (!currentRoles.some(r => r.id === role.id)) {
        this.pageForm.get('roles')?.setValue([...currentRoles, role]);
      }
    } else {
      this.pageForm.get('roles')?.setValue(currentRoles.filter(r => r.id !== role.id));
    }
  }

  isRoleSelected(role: RoleDto): boolean {
    const roles = this.pageForm.get('roles')?.value as RoleDto[] || [];
    return roles.some(r => r.id === role.id);
  }
} 