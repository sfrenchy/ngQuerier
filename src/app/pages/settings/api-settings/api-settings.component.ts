import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '@services/api.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ApiConfiguration } from '@models/api.models';

@Component({
  selector: 'app-api-settings',
  templateUrl: './api-settings.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule
  ]
})
export class ApiSettingsComponent implements OnInit {
  apiForm: FormGroup;
  isLoading = false;
  protocols = ['http', 'https'];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang('fr');
    this.translate.use('fr');
    
    this.apiForm = this.fb.group({
      scheme: [''],
      host: [''],
      port: [null],
      allowedHosts: [''],
      allowedOrigins: [''],
      allowedMethods: [''],
      allowedHeaders: [''],
      resetPasswordTokenValidity: [null],
      emailConfirmationTokenValidity: [null],
      passwordRules: this.fb.group({
        requireDigit: [false],
        requireLowercase: [false],
        requireUppercase: [false],
        requireNonAlphanumeric: [false],
        requiredLength: [null],
        requiredUniqueChars: [null]
      }),
      smtp: this.fb.group({
        host: [''],
        port: [null],
        username: [''],
        password: [''],
        useSSL: [false],
        senderEmail: [''],
        senderName: [''],
        requireAuth: [false]
      }),
      redis: this.fb.group({
        enabled: [false],
        host: [''],
        port: [null]
      })
    });
  }

  ngOnInit(): void {
    this.loadConfiguration();
  }

  loadConfiguration(): void {
    this.isLoading = true;
    this.apiService.getApiConfiguration().subscribe({
      next: (config) => {
        // Patch form values with API response
        this.apiForm.patchValue({
          scheme: config.Scheme?.toLowerCase(),
          host: config.Host,
          port: config.Port,
          allowedHosts: config.AllowedHosts,
          allowedOrigins: config.AllowedOrigins,
          allowedMethods: config.AllowedMethods,
          allowedHeaders: config.AllowedHeaders,
          resetPasswordTokenValidity: config.ResetPasswordTokenValidity,
          emailConfirmationTokenValidity: config.EmailConfirmationTokenValidity,
          passwordRules: {
            requireDigit: config.RequireDigit,
            requireLowercase: config.RequireLowercase,
            requireUppercase: config.RequireUppercase,
            requireNonAlphanumeric: config.RequireNonAlphanumeric,
            requiredLength: config.RequiredLength,
            requiredUniqueChars: config.RequiredUniqueChars
          },
          smtp: {
            host: config.SmtpHost,
            port: config.SmtpPort,
            username: config.SmtpUsername,
            password: config.SmtpPassword,
            useSSL: config.SmtpUseSSL,
            senderEmail: config.SmtpSenderEmail,
            senderName: config.SmtpSenderName,
            requireAuth: config.SmtpRequireAuth
          },
          redis: {
            enabled: config.RedisEnabled,
            host: config.RedisHost,
            port: config.RedisPort
          }
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading API configuration:', error);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.apiForm.valid) {
      this.isLoading = true;
      const formValue = this.apiForm.value;
      
      // Transform form value to match API expectations
      const config: ApiConfiguration = {
        Scheme: formValue.scheme?.toUpperCase(),
        Host: formValue.host,
        Port: formValue.port,
        AllowedHosts: formValue.allowedHosts,
        AllowedOrigins: formValue.allowedOrigins,
        AllowedMethods: formValue.allowedMethods,
        AllowedHeaders: formValue.allowedHeaders,
        ResetPasswordTokenValidity: formValue.resetPasswordTokenValidity,
        EmailConfirmationTokenValidity: formValue.emailConfirmationTokenValidity,
        RequireDigit: formValue.passwordRules.requireDigit,
        RequireLowercase: formValue.passwordRules.requireLowercase,
        RequireUppercase: formValue.passwordRules.requireUppercase,
        RequireNonAlphanumeric: formValue.passwordRules.requireNonAlphanumeric,
        RequiredLength: formValue.passwordRules.requiredLength,
        RequiredUniqueChars: formValue.passwordRules.requiredUniqueChars,
        SmtpHost: formValue.smtp.host,
        SmtpPort: formValue.smtp.port,
        SmtpUsername: formValue.smtp.username,
        SmtpPassword: formValue.smtp.password,
        SmtpUseSSL: formValue.smtp.useSSL,
        SmtpSenderEmail: formValue.smtp.senderEmail,
        SmtpSenderName: formValue.smtp.senderName,
        SmtpRequireAuth: formValue.smtp.requireAuth,
        RedisEnabled: formValue.redis.enabled,
        RedisHost: formValue.redis.host,
        RedisPort: formValue.redis.port
      };

      this.apiService.updateApiConfiguration(config).subscribe({
        next: () => {
          this.isLoading = false;
          // TODO: Show success message
        },
        error: (error) => {
          console.error('Error updating API configuration:', error);
          this.isLoading = false;
          // TODO: Show error message
        }
      });
    }
  }
} 