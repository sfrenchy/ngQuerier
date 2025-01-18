import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserService } from '@services/user.service';
import { ApiService } from '@services/api.service';
import { IconPickerComponent } from '@shared/components/icon-picker/icon-picker.component';
import { TranslatableString, RoleDto, MenuCreateDto, MenuDto } from '@models/api.models';
import { TranslatableStringFormComponent } from '@shared/components/translatable-string-form/translatable-string-form.component';

@Component({
  selector: 'app-menu-form',
  templateUrl: './menu-form.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, IconPickerComponent, TranslatableStringFormComponent]
})
export class MenuFormComponent implements OnInit {
  menuForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  isEditMode = false;
  categoryId: number | null = null;
  availableRoles: RoleDto[] = [];
  menuTitles: TranslatableString[] = [];
  currentMenu: MenuDto | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {
    this.menuForm = this.fb.group({
      icon: ['', Validators.required],
      isVisible: [true],
      roles: [[]],
      route: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.categoryId = +id;
      this.loadCategory(this.categoryId);
    } else {
      // Initialiser avec les langues par défaut seulement pour un nouveau menu
      this.menuTitles = [
        { languageCode: 'fr', value: '' },
        { languageCode: 'en', value: '' }
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
        this.error = this.translate.instant('ERRORS.LOAD_ROLES');
      }
    });
  }

  loadCategory(id: number): void {
    this.isLoading = true;
    this.apiService.getMenu(id).subscribe({
      next: (menu) => {
        this.currentMenu = menu;
        // Copie profonde des traductions pour éviter les références partagées
        this.menuTitles = JSON.parse(JSON.stringify(menu.title));
        
        // Mise à jour du formulaire après l'affectation des traductions
        setTimeout(() => {
          this.menuForm.patchValue({
            icon: menu.icon,
            isVisible: menu.isVisible,
            roles: menu.roles.map(r => r.name),
            route: menu.route
          });
          this.isLoading = false;
        });
      },
      error: (error) => {
        console.error('Error loading menu:', error);
        this.error = this.translate.instant('ERRORS.LOAD_MENU');
        this.isLoading = false;
      }
    });
  }

  isFormValid(): boolean {
    if (!this.menuForm.valid) {
      return false;
    }
    
    // Vérifier que les titres sont valides
    return this.menuTitles.some(title => 
      title && 
      title.languageCode && 
      title.value && 
      title.value.trim() !== ''
    );
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      const formValue = { ...this.menuForm.value };
      const selectedRoleNames = formValue.roles as string[];
      const selectedRoles = this.availableRoles.filter(role => selectedRoleNames.includes(role.name));

      if (this.isEditMode && this.currentMenu) {
        // Pour la mise à jour, on utilise MenuDto
        const menuData: MenuDto = {
          ...this.currentMenu,
          icon: formValue.icon,
          isVisible: formValue.isVisible,
          route: formValue.route,
          title: this.menuTitles,
          roles: selectedRoles
        };
        this.updateMenu(menuData);
      } else {
        // Pour la création, on utilise MenuCreateDto
        const menuData: MenuCreateDto = {
          icon: formValue.icon,
          isVisible: formValue.isVisible,
          route: formValue.route,
          title: this.menuTitles,
          roles: selectedRoles,
          order: 9999 // Valeur par défaut élevée, sera réordonnée par le drag & drop
        };
        this.createMenu(menuData);
      }
    }
  }

  private createMenu(menuData: MenuCreateDto): void {
    this.isLoading = true;
    this.apiService.createMenu(menuData).subscribe({
      next: () => {
        this.router.navigate(['/home/contents']);
      },
      error: (error) => {
        console.error('Error creating menu:', error);
        this.error = this.translate.instant('ERRORS.CREATE_MENU');
        this.isLoading = false;
      }
    });
  }

  private updateMenu(menuData: MenuDto): void {
    this.isLoading = true;
    this.apiService.updateMenu(this.categoryId!, menuData).subscribe({
      next: () => {
        this.router.navigate(['/home/contents']);
      },
      error: (error) => {
        console.error('Error updating menu:', error);
        this.error = this.translate.instant('ERRORS.UPDATE_MENU');
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/home/contents']);
  }

  handleRoleChange(role: RoleDto, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const currentRoles = this.menuForm.get('roles')?.value as string[] || [];

    if (checkbox.checked) {
      this.menuForm.patchValue({
        roles: [...currentRoles, role.name]
      });
    } else {
      this.menuForm.patchValue({
        roles: currentRoles.filter(r => r !== role.name)
      });
    }
  }

  isRoleSelected(role: RoleDto): boolean {
    const roles = this.menuForm.get('roles')?.value as string[] || [];
    return roles.includes(role.name);
  }
}
