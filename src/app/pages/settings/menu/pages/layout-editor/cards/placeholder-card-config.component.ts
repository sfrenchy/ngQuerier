import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BaseCardConfigComponent } from './base-card-config.component';

interface PlaceholderConfig {
  label: string;
}

@Component({
  selector: 'app-placeholder-card-config',
  template: `
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Libellé</label>
        <input type="text" [formControl]="form.get('config.label')"
               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class PlaceholderCardConfigComponent extends BaseCardConfigComponent {
  override getSpecificControls() {
    return {
      config: this.fb.group({
        label: [(this.card.config as PlaceholderConfig)?.label || '', []]
      })
    };
  }
} 