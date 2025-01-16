import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-icon-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <button type="button" 
              (click)="toggleDropdown()"
              class="w-full flex items-center justify-between px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
        <div class="flex items-center">
          <i *ngIf="selectedIcon" [class]="selectedIcon" class="mr-2"></i>
          <span class="text-gray-300">{{ selectedIcon || 'Sélectionner une icône' }}</span>
        </div>
        <i class="fas fa-chevron-down text-gray-400"></i>
      </button>

      <div *ngIf="isOpen" 
           class="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
        <div class="grid grid-cols-6 gap-2 p-2">
          <button *ngFor="let icon of availableIcons" 
                  (click)="selectIcon(icon)"
                  class="flex items-center justify-center p-2 hover:bg-gray-700 rounded-md"
                  [class.bg-blue-600]="icon === selectedIcon">
            <i [class]="icon"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IconSelectorComponent),
      multi: true
    }
  ]
})
export class IconSelectorComponent implements ControlValueAccessor {
  selectedIcon: string = '';
  isOpen = false;

  // Liste des icônes disponibles (Font Awesome)
  availableIcons = [
    'fas fa-chart-bar',
    'fas fa-chart-line',
    'fas fa-chart-pie',
    'fas fa-table',
    'fas fa-list',
    'fas fa-tag',
    'fas fa-tags',
    'fas fa-bookmark',
    'fas fa-star',
    'fas fa-heart',
    'fas fa-bell',
    'fas fa-calendar',
    'fas fa-clock',
    'fas fa-cog',
    'fas fa-home',
    'fas fa-user',
    'fas fa-users',
    'fas fa-envelope',
    'fas fa-file',
    'fas fa-folder',
    'fas fa-image',
    'fas fa-video',
    'fas fa-music',
    'fas fa-map'
  ];

  // Implémentation de ControlValueAccessor
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.selectedIcon = value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  selectIcon(icon: string): void {
    this.selectedIcon = icon;
    this.onChange(icon);
    this.onTouched();
    this.isOpen = false;
  }
} 