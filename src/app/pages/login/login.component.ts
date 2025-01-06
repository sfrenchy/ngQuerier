import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from '../../components/language-selector/language-selector.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, LanguageSelectorComponent]
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  selectedUrl = '';
  showPassword = false;
  isLoading = false;
  isConfigured = false;
  isCheckingConfiguration = false;
  apiError: string | null = null;
  urls: string[] = [];

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadSavedUrls();
  }

  loadSavedUrls() {
    const savedUrls = localStorage.getItem('savedApiUrls');
    this.urls = savedUrls ? JSON.parse(savedUrls) : [];
  }

  onUrlChange() {
    if (this.selectedUrl) {
      this.apiService.setBaseUrl(this.selectedUrl);
      this.apiError = null;
      
      this.isCheckingConfiguration = true;
      this.apiService.isConfigured().subscribe(
        isConfigured => {
          this.isConfigured = isConfigured;
          this.isCheckingConfiguration = false;
        },
        error => {
          console.error('Error checking configuration:', error);
          this.isConfigured = false;
          this.isCheckingConfiguration = false;
          
          if (error instanceof HttpErrorResponse) {
            if (error.status === 0) {
              this.apiError = "Impossible de joindre l'API";
            } else if (error.status >= 500) {
              this.apiError = "L'API est actuellement indisponible";
            } else {
              this.apiError = "Une erreur est survenue lors de la connexion à l'API";
            }
          }
        }
      );
    } else {
      this.isConfigured = false;
      this.apiError = null;
    }
  }

  onAddApi() {
    this.router.navigate(['/add-api']);
  }

  onConfigureApi() {
    // TODO: Implémenter la configuration de l'API
    console.log('Configure API clicked');
  }

  onDeleteUrl(url: string) {
    const savedUrls = this.urls.filter(u => u !== url);
    localStorage.setItem('savedApiUrls', JSON.stringify(savedUrls));
    this.urls = savedUrls;
    this.selectedUrl = '';
    this.apiError = null;
  }

  onSubmit() {
    if (!this.selectedUrl || !this.email || !this.password) return;

    this.isLoading = true;
    this.authService.login(this.email, this.password).subscribe(
      success => {
        if (success) {
          this.router.navigate(['/dashboard']);
        }
        this.isLoading = false;
      },
      error => {
        console.error('Login failed:', error);
        this.isLoading = false;
      }
    );
  }
} 