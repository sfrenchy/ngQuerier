import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@services/api.service';
import { LayoutDto } from '@models/api.models';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-dynamic-page',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './dynamic-page.component.html'
})
export class DynamicPageComponent implements OnInit {
  protected readonly Object = Object;
  layout: LayoutDto | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    public userService: UserService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadPageLayout(parseInt(params['id'], 10));
      }
    });
  }

  private loadPageLayout(pageId: number) {
    this.isLoading = true;
    this.error = null;
    
    this.apiService.getLayout(pageId).subscribe({
      next: (layout) => {
        this.layout = layout;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading layout:', error);
        this.error = error.message;
        this.isLoading = false;
      }
    });
  }
} 