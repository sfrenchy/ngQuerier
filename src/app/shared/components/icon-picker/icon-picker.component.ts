import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-icon-picker',
  templateUrl: './icon-picker.component.html',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule, TranslateModule],
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
  searchTerm = '';
  private allIconKeys: string[] = [];

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
    this.allIconKeys = Array.from(uniqueIcons).sort();
    this.iconKeys = [...this.allIconKeys];
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
      if (this.isOpen) {
        this.searchTerm = '';
        this.currentPage = 1;
        this.iconKeys = [...this.allIconKeys];
      }
    }
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1;
    if (!term) {
      this.iconKeys = [...this.allIconKeys];
    } else {
      const searchLower = term.toLowerCase();
      this.iconKeys = this.allIconKeys.filter(key => 
        key.toLowerCase().includes(searchLower)
      );
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
