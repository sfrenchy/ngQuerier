import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuService } from '@services/menu.service';
import { MenuPage } from '@models/api.models';
import { UserService } from '@services/user.service';

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
    private menuService: MenuService,
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
    console.log('Loading roles...');
    this.userService.getRoles().subscribe({
      next: (roles) => {
        console.log('Roles received:', roles);
        this.availableRoles = roles.map(role => role.Name);
        console.log('Available roles:', this.availableRoles);
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.error = error.message;
      }
    });
  }

  loadPage(id: number): void {
    this.isLoading = true;
    this.menuService.getPage(id).subscribe({
      next: (page) => {
        console.log('Page loaded:', page);
        this.pageForm.patchValue({
          Names: page.Names,
          Icon: page.Icon,
          Order: page.Order,
          IsVisible: page.IsVisible,
          Roles: page.Roles.map(r => r.Name),
          Route: page.Route
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

    console.log('Submitting form data:', formData);

    const saveObservable = this.isEditMode && this.pageId
      ? this.menuService.updatePage(this.pageId, formData)
      : this.menuService.createPage(formData);

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
    console.log('Roles after change:', this.pageForm.get('Roles')?.value);
  }

  isRoleSelected(role: string): boolean {
    const roles = this.pageForm.get('Roles')?.value as string[] || [];
    return roles.includes(role);
  }
} 