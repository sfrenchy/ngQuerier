import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { LanguageSelectorComponent } from '@components/language-selector/language-selector.component';
import { EmailValidators } from '@validators/email.validator';
import { EMAIL_ERROR_MESSAGES } from '@validators/email-error-messages';
import { PasswordValidators } from '@validators/password.validator';
import { PASSWORD_ERROR_MESSAGES } from '@validators/password-error-messages';

@Component({
  selector: 'app-admin-configuration',
  templateUrl: './admin-configuration.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    LanguageSelectorComponent
  ]
})
export class AdminConfigurationComponent {
  adminForm: FormGroup;
  showPassword = false;
  readonly emailErrorMessages = EMAIL_ERROR_MESSAGES;
  readonly passwordErrorMessages = PASSWORD_ERROR_MESSAGES;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private translate: TranslateService
  ) {
    // Récupérer les données sauvegardées si elles existent
    const savedData = JSON.parse(localStorage.getItem('adminConfig') || '{}');

    this.adminForm = this.formBuilder.group({
      firstName: [savedData.firstName || '', Validators.required],
      lastName: [savedData.lastName || '', Validators.required],
      email: [savedData.email || '', [
        Validators.required,
        EmailValidators.validate
      ]],
      password: [savedData.password || '', [
        Validators.required,
        PasswordValidators.createValidator({
          requiredLength: 12,
          requireDigit: true,
          requireLowercase: true,
          requireUppercase: true,
          requireNonAlphanumeric: true,
          requiredUniqueChars: 1
        })
      ]]
    });
  }

  // Getters pour faciliter l'accès aux contrôles du formulaire
  get emailControl(): AbstractControl | null {
    return this.adminForm.get('email');
  }

  get passwordControl(): AbstractControl | null {
    return this.adminForm.get('password');
  }

  get emailErrors(): string[] {
    const control = this.emailControl;
    if (!control?.errors || !control.touched) {
      return [];
    }
    return Object.keys(control.errors).map(key => this.emailErrorMessages[key]);
  }

  get passwordErrors(): string[] {
    const control = this.passwordControl;
    if (!control?.errors || !control.touched) {
      return [];
    }
    return Object.keys(control.errors).map(key => {
      const error = control.errors![key];
      if (key === 'minlength') {
        return this.translate.instant(this.passwordErrorMessages[key], { length: error.requiredLength });
      }
      if (key === 'requireUniqueChars') {
        return this.translate.instant(this.passwordErrorMessages[key], { count: error.required });
      }
      return this.translate.instant(this.passwordErrorMessages[key]);
    });
  }

  onNext(): void {
    if (this.adminForm.valid) {
      // Store form data and navigate to SMTP configuration
      localStorage.setItem('adminConfig', JSON.stringify(this.adminForm.value));
      this.router.navigate(['/configure/smtp']);
    }
  }

  onCancel(): void {
    // Nettoyer les données stockées avant de quitter
    localStorage.removeItem('adminConfig');
    localStorage.removeItem('smtpConfig');
    this.router.navigate(['/login']);
  }
} 