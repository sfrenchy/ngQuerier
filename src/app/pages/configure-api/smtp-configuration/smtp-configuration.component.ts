import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ApiService } from '@services/api.service';
import { LanguageSelectorComponent } from '@components/language-selector/language-selector.component';

@Component({
  selector: 'app-smtp-configuration',
  templateUrl: './smtp-configuration.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    LanguageSelectorComponent
  ]
})
export class SmtpConfigurationComponent {
  smtpForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private apiService: ApiService
  ) {
    this.smtpForm = this.formBuilder.group({
      host: ['', Validators.required],
      port: ['', [Validators.required, Validators.min(1), Validators.max(65535)]],
      useSSL: [true],
      requireAuth: [true],
      username: [''],
      password: [''],
      senderEmail: ['', [Validators.required, Validators.email]],
      senderName: ['', Validators.required]
    });

    // Update validators based on requireAuth value
    this.smtpForm.get('requireAuth')?.valueChanges.subscribe(requireAuth => {
      const usernameControl = this.smtpForm.get('username');
      const passwordControl = this.smtpForm.get('password');
      
      if (requireAuth) {
        usernameControl?.setValidators(Validators.required);
        passwordControl?.setValidators(Validators.required);
      } else {
        usernameControl?.clearValidators();
        passwordControl?.clearValidators();
      }
      
      usernameControl?.updateValueAndValidity();
      passwordControl?.updateValueAndValidity();
    });
  }

  onBack(): void {
    // Sauvegarder les données SMTP actuelles
    if (this.smtpForm.dirty) {
      localStorage.setItem('smtpConfig', JSON.stringify(this.smtpForm.value));
    }
    this.router.navigate(['/configure/admin']);
  }

  onFinish(): void {
    if (this.smtpForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = null;
      const adminConfig = JSON.parse(localStorage.getItem('adminConfig') || '{}');
      const smtpConfig = this.smtpForm.value;

      if (!adminConfig.password) {
        this.isLoading = false;
        this.errorMessage = 'Admin password is missing';
        return;
      }

      // Test SMTP configuration first
      this.apiService.testSmtpConfiguration(smtpConfig).subscribe({
        next: (success: boolean) => {
          if (success) {
            // If test is successful, proceed with setup
            const setupConfig = {
              firstName: adminConfig.firstName,
              lastName: adminConfig.lastName,
              email: adminConfig.email,
              password: adminConfig.password,
              host: smtpConfig.host,
              port: smtpConfig.port,
              useSSL: smtpConfig.useSSL,
              requireAuth: smtpConfig.requireAuth,
              username: smtpConfig.username,
              smtpPassword: smtpConfig.password,
              senderEmail: smtpConfig.senderEmail,
              senderName: smtpConfig.senderName
            };

            this.apiService.setup(setupConfig).subscribe({
              next: (setupSuccess: boolean) => {
                this.isLoading = false;
                if (setupSuccess) {
                  // Clean up stored data and redirect
                  localStorage.removeItem('adminConfig');
                  localStorage.removeItem('smtpConfig');
                  this.router.navigate(['/login']);
                } else {
                  this.errorMessage = 'CONFIGURE.SMTP.ERROR.SETUP_FAILED';
                }
              },
              error: (error: unknown) => {
                this.isLoading = false;
                this.errorMessage = 'CONFIGURE.SMTP.ERROR.SETUP_FAILED';
                console.error('Setup error:', error);
              }
            });
          } else {
            this.isLoading = false;
            this.errorMessage = 'CONFIGURE.SMTP.ERROR.TEST_FAILED';
          }
        },
        error: (error: unknown) => {
          this.isLoading = false;
          this.errorMessage = 'CONFIGURE.SMTP.ERROR.TEST_FAILED';
          console.error('SMTP test error:', error);
        }
      });
    }
  }
} 