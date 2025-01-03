import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  selectedUrl: string = '';
  urls: string[] = ['http://localhost:3000', 'https://api.example.com'];

  onSubmit() {
    this.isLoading = true;
    // Logique de connexion à implémenter
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }
} 