import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from '@components/language-selector/language-selector.component';
import { ApiService } from '@services/api.service';

@Component({
  selector: 'app-add-api',
  templateUrl: './add-api.component.html',
  styleUrls: ['./add-api.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, LanguageSelectorComponent]
})
export class AddApiComponent {
  apiForm: FormGroup;
  protocols = ['http', 'https'];
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    public router: Router,
    private translate: TranslateService,
    private apiService: ApiService
  ) {
    this.apiForm = this.formBuilder.group({
      protocol: ['https', Validators.required],
      host: ['', Validators.required],
      port: ['', [Validators.required, Validators.min(1), Validators.max(65535)]],
      path: ['', Validators.required]
    });
  }

  get fullUrl(): string {
    const form = this.apiForm.value;
    return `${form.protocol}://${form.host}:${form.port}/${form.path}`;
  }

  onSubmit(): void {
    if (this.apiForm.valid) {
      this.isLoading = true;
      const url = this.fullUrl;
      // Get the current list of URLs from localStorage
      const savedUrls = JSON.parse(localStorage.getItem('apiUrls') || '[]');
      // Add the new URL to the list
      savedUrls.push(url);
      // Save the updated list back to localStorage
      localStorage.setItem('apiUrls', JSON.stringify(savedUrls));
      // Set the base URL in the API service
      this.apiService.setBaseUrl(url);
      // Navigate back to login
      setTimeout(() => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      }, 1000);
    }
  }
} 