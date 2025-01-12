import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserService } from '@services/user.service';
import { ApiService } from '@services/api.service';
@Component({
  selector: 'app-page-form',
  templateUrl: './page-form.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule]
})
export class PageFormComponent implements OnInit {
  pageForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  isEditMode = false;
  pageId: number | null = null;
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
    this.pageForm = this.fb.group({
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
    this.categoryId = Number(this.route.snapshot.paramMap.get('categoryId'));
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
        this.availableRoles = roles.map(role => role.name);
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
          names: page.names,
          icon: page.icon,
          order: page.order,
          isVisible: page.isVisible,
          roles: page.roles.map(r => r.name),
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
    if (this.pageForm.invalid || !this.categoryId) return;

    this.isLoading = true;
    const formData = {
      ...this.pageForm.value,
      MenuCategoryId: this.categoryId
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

  onRoleChange(role: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const currentRoles = this.pageForm.get('Roles')?.value as string[] || [];
    
    if (checkbox.checked) {
      this.pageForm.get('Roles')?.setValue([...currentRoles, role]);
    } else {
      this.pageForm.get('Roles')?.setValue(currentRoles.filter(r => r !== role));
    }
  }

  isRoleSelected(role: string): boolean {
    const roles = this.pageForm.get('Roles')?.value as string[] || [];
    return roles.includes(role);
  }
} 