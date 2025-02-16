import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {UserService} from '@services/user.service';
import {ApiService} from '@services/api.service';
import {RoleDto, TranslatableString} from '@models/api.models';
import {IconPickerComponent} from '@shared/components/icon-picker/icon-picker.component';
import {
  TranslatableStringFormComponent
} from '@shared/components/translatable-string-form/translatable-string-form.component';

@Component({
  selector: 'app-page-form',
  templateUrl: './page-form.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, IconPickerComponent, TranslatableStringFormComponent]
})
export class PageFormComponent implements OnInit {
  pageForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  isEditMode = false;
  pageId: number | null = null;
  menuId: number | null = null;
  availableRoles: RoleDto[] = [];
  pageTitles: TranslatableString[] = [];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {
    this.pageForm = this.fb.group({
      icon: ['', Validators.required],
      isVisible: [true],
      roles: [[]],
      route: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    this.menuId = Number(this.route.snapshot.paramMap.get('id'));

    const pageId = this.route.snapshot.paramMap.get('pageId');
    if (pageId) {
      this.isEditMode = true;
      this.pageId = Number(pageId);
      this.loadPage(this.pageId);
    } else {
      // Initialiser avec les langues par défaut
      this.pageTitles = [
        {languageCode: 'fr', value: ''},
        {languageCode: 'en', value: ''}
      ];
    }
  }

  loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (roles) => {
        this.availableRoles = roles;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.error = 'Error loading roles';
      }
    });
  }

  loadPage(id: number): void {
    this.isLoading = true;
    this.apiService.getPage(id).subscribe({
      next: (page) => {
        this.pageForm.patchValue({
          icon: page.icon,
          isVisible: page.isVisible,
          roles: page.roles.map(r => r.id),
          route: page.route
        });

        // Forcer la détection de changement en créant un nouveau tableau
        this.pageTitles = [...page.title];

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading page:', error);
        this.error = 'Error loading page';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.pageForm.valid && this.pageTitles.length > 0) {
      const formValue = this.pageForm.value;
      const pageData = {
        ...formValue,
        title: this.pageTitles,
        menuId: this.menuId,
        roles: this.availableRoles.filter(role => formValue.roles.includes(role.id)),
        order: this.isEditMode ? undefined : 9999
      };

      this.isLoading = true;
      const request = this.isEditMode
        ? this.apiService.updatePage(this.pageId!, pageData)
        : this.apiService.createPage(pageData);

      request.subscribe({
        next: () => {
          this.router.navigate(['..'], {relativeTo: this.route});
        },
        error: (error) => {
          console.error('Error saving page:', error);
          this.error = this.translate.instant('ERRORS.SAVE_PAGE');
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['..'], {relativeTo: this.route});
  }

  onRoleChange(role: RoleDto, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const currentRoles = this.pageForm.get('roles')?.value as number[] || [];

    if (checkbox.checked) {
      this.pageForm.patchValue({
        roles: [...currentRoles, role.id]
      });
    } else {
      this.pageForm.patchValue({
        roles: currentRoles.filter(id => id !== role.id)
      });
    }
  }

  isRoleSelected(role: RoleDto): boolean {
    const currentRoles = this.pageForm.get('roles')?.value as number[] || [];
    return currentRoles.includes(role.id);
  }
}
