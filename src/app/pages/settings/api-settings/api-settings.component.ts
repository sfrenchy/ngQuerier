import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {ApiService} from '@services/api.service';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {ApiConfiguration} from '@models/api.models';

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
          scheme: config.scheme?.toLowerCase(),
          host: config.host,
          port: config.port,
          allowedHosts: config.allowedHosts,
          allowedOrigins: config.allowedOrigins,
          allowedMethods: config.allowedMethods,
          allowedHeaders: config.allowedHeaders,
          resetPasswordTokenValidity: config.resetPasswordTokenValidity,
          emailConfirmationTokenValidity: config.emailConfirmationTokenValidity,
          passwordRules: {
            requireDigit: config.requireDigit,
            requireLowercase: config.requireLowercase,
            requireUppercase: config.requireUppercase,
            requireNonAlphanumeric: config.requireNonAlphanumeric,
            requiredLength: config.requiredLength,
            requiredUniqueChars: config.requiredUniqueChars
          },
          smtp: {
            host: config.smtpHost,
            port: config.smtpPort,
            username: config.smtpUsername,
            password: config.smtpPassword,
            useSSL: config.smtpUseSSL,
            senderEmail: config.smtpSenderEmail,
            senderName: config.smtpSenderName,
            requireAuth: config.smtpRequireAuth
          },
          redis: {
            enabled: config.redisEnabled,
            host: config.redisHost,
            port: config.redisPort
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
        scheme: formValue.scheme?.toUpperCase(),
        host: formValue.host,
        port: formValue.port,
        allowedHosts: formValue.allowedHosts,
        allowedOrigins: formValue.allowedOrigins,
        allowedMethods: formValue.allowedMethods,
        allowedHeaders: formValue.allowedHeaders,
        resetPasswordTokenValidity: formValue.resetPasswordTokenValidity,
        emailConfirmationTokenValidity: formValue.emailConfirmationTokenValidity,
        requireDigit: formValue.passwordRules.requireDigit,
        requireLowercase: formValue.passwordRules.requireLowercase,
        requireUppercase: formValue.passwordRules.requireUppercase,
        requireNonAlphanumeric: formValue.passwordRules.requireNonAlphanumeric,
        requiredLength: formValue.passwordRules.requiredLength,
        requiredUniqueChars: formValue.passwordRules.requiredUniqueChars,
        smtpHost: formValue.smtp.host,
        smtpPort: formValue.smtp.port,
        smtpUsername: formValue.smtp.username,
        smtpPassword: formValue.smtp.password,
        smtpUseSSL: formValue.smtp.useSSL,
        smtpSenderEmail: formValue.smtp.senderEmail,
        smtpSenderName: formValue.smtp.senderName,
        smtpRequireAuth: formValue.smtp.requireAuth,
        redisEnabled: formValue.redis.enabled,
        redisHost: formValue.redis.host,
        redisPort: formValue.redis.port
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
