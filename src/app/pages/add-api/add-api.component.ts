import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-api',
  templateUrl: './add-api.component.html',
  styleUrls: ['./add-api.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class AddApiComponent implements OnInit {
  apiForm: FormGroup;
  isLoading = false;
  protocols = ['http', 'https'];

  constructor(
    private fb: FormBuilder,
    public router: Router
  ) {
    this.apiForm = this.fb.group({
      protocol: ['https', Validators.required],
      host: ['', [Validators.required]],
      port: [5000, [Validators.required, Validators.min(1), Validators.max(65535)]],
      path: ['api/v1', Validators.required]
    });
  }

  ngOnInit(): void {}

  get fullUrl(): string {
    const form = this.apiForm.value;
    return `${form.protocol}://${form.host}:${form.port}/${form.path}`;
  }

  onSubmit(): void {
    if (this.apiForm.valid) {
      this.isLoading = true;
      const savedUrls = JSON.parse(localStorage.getItem('savedApiUrls') || '[]');
      savedUrls.push(this.fullUrl);
      localStorage.setItem('savedApiUrls', JSON.stringify(savedUrls));
      
      setTimeout(() => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      }, 500);
    }
  }
} 