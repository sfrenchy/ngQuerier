import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlay, faCheck, faWarning } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-progress-indicator',
  standalone: true,
  imports: [CommonModule, TranslateModule, FontAwesomeModule],
  templateUrl: './progress-indicator.component.html'
})
export class ProgressIndicatorComponent {
  @Input() progress = 0;
  @Input() status = '';
  @Input() error?: string;
  @Input() showPercentage = true;

  protected readonly faPlay = faPlay;
  protected readonly faCheck = faCheck;
  protected readonly faWarning = faWarning;

  getContainerClass(): string {
    if (this.error) return 'border-red-200 bg-red-50';
    if (this.progress === 100) return 'border-green-200 bg-green-50';
    return 'border-indigo-200 bg-indigo-50';
  }

  getProgressBarClass(): string {
    if (this.error) return 'bg-red-500';
    if (this.progress === 100) return 'bg-green-500';
    return 'bg-indigo-500';
  }

  getIconClass(): string {
    if (this.error) return 'text-red-500';
    if (this.progress === 100) return 'text-green-500';
    return 'text-indigo-500';
  }

  getIcon() {
    if (this.error) return this.faWarning;
    if (this.progress === 100) return this.faCheck;
    return this.faPlay;
  }
}
