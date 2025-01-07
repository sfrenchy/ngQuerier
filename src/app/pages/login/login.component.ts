import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { LanguageSelectorComponent } from '@components/language-selector/language-selector.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule, LanguageSelectorComponent]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  isCheckingConfiguration = false;
  isConfigured = false;
  apiUrls: string[] = [];
  selectedUrl: string | null = null;
  apiError = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Load saved API URLs from localStorage
    const savedUrls = localStorage.getItem('apiUrls');
    if (savedUrls) {
      this.apiUrls = JSON.parse(savedUrls);
      // Select the first URL by default
      if (this.apiUrls.length > 0) {
        this.selectedUrl = this.apiUrls[0];
        this.onUrlChange();
      }
    }
  }

  onUrlChange(): void {
    if (this.selectedUrl) {
      this.apiService.setBaseUrl(this.selectedUrl);
      this.apiError = false;
      this.isCheckingConfiguration = true;
      this.isConfigured = false;

      this.apiService.checkConfiguration().subscribe({
        next: (isConfigured: boolean) => {
          this.isConfigured = isConfigured;
          this.isCheckingConfiguration = false;
          this.apiError = false;
        },
        error: () => {
          this.apiError = true;
          this.isCheckingConfiguration = false;
          this.isConfigured = false;
        }
      });
    }
  }

  onDeleteUrl(url: string): void {
    const index = this.apiUrls.indexOf(url);
    if (index > -1) {
      this.apiUrls.splice(index, 1);
      localStorage.setItem('apiUrls', JSON.stringify(this.apiUrls));
      
      // If there are remaining URLs, select the first one
      if (this.apiUrls.length > 0) {
        this.selectedUrl = this.apiUrls[0];
        this.onUrlChange();
      } else {
        this.selectedUrl = null;
        this.isConfigured = false;
      }
    }
  }

  onAddApi(): void {
    this.router.navigate(['/add-api']);
  }

  onConfigureApi(): void {
    this.router.navigate(['/configure/admin']);
  }

  onSubmit(): void {
    if (this.loginForm.valid && this.selectedUrl) {
      this.isLoading = true;
      const { email, password } = this.loginForm.value;
      
      this.authService.login(email, password).subscribe({
        next: (success: boolean) => {
          if (success) {
            this.router.navigate(['/home']);
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          // TODO: Show error message
        }
      });
    }
  }
} 