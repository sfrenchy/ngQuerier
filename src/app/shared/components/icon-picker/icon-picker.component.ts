import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

@Component({
  selector: 'app-icon-picker',
  templateUrl: './icon-picker.component.html',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IconPickerComponent),
      multi: true
    }
  ]
})
export class IconPickerComponent implements ControlValueAccessor {
  value: string | null = null;
  disabled = false;
  isOpen = false;
  currentPage = 1;
  pageSize = 64; // 8x8 grid
  private iconKeys: string[] = [];

  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas);
    this.initializeIconKeys();
  }

  private initializeIconKeys(): void {
    const uniqueIcons = new Set<string>();
    Object.values(fas).forEach(value => {
      if (this.isIconDefinition(value)) {
        uniqueIcons.add(value.iconName);
      }
    });
    this.iconKeys = Array.from(uniqueIcons).sort();
  }

  private isIconDefinition(value: any): value is IconDefinition {
    return typeof value === 'object' && 
           value !== null && 
           'iconName' in value &&
           'prefix' in value;
  }

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggleDropdown(): void {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
    }
  }

  getIconKeys(): string[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.iconKeys.slice(start, start + this.pageSize);
  }

  getTotalPages(): number {
    return Math.ceil(this.iconKeys.length / this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  selectIcon(iconName: string): void {
    if (!this.disabled) {
      this.value = iconName;
      this.onChange(iconName);
      this.onTouched();
      this.isOpen = false;
    }
  }
}
