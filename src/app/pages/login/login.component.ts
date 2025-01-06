import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  selectedUrl = '';
  showPassword = false;
  isLoading = false;
  urls: string[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadSavedUrls();
  }

  loadSavedUrls() {
    const savedUrls = localStorage.getItem('savedApiUrls');
    this.urls = savedUrls ? JSON.parse(savedUrls) : [];
  }

  onAddApi() {
    this.router.navigate(['/add-api']);
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