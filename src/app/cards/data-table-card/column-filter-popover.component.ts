import { Component, Input, Output, EventEmitter, ElementRef, AfterViewInit, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColumnConfig } from './data-table-card.component';

@Component({
  selector: 'app-column-filter-popover',
  templateUrl: './column-filter-popover.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  host: {
    'class': 'fixed'  // Pour s'assurer que le popover est positionné par rapport au viewport
  }
})
export class ColumnFilterPopoverComponent implements AfterViewInit, OnInit, OnChanges {
  @Input() column!: ColumnConfig;
  @Input() values: string[] = [];
  @Input() selectedValues: Set<string> = new Set<string>();
  @Input() triggerElement!: HTMLElement;
  @Output() filterChange = new EventEmitter<Set<string>>();

  searchTerm: string = '';
  filteredValues: string[] = [];
  position: { top: string, left: string, transform: string } = { 
    top: '0', 
    left: '0',
    transform: 'translate(-50%, 0)'
  };

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    this.updatePosition();
    // Réajuster la position lors du redimensionnement de la fenêtre
    window.addEventListener('resize', () => this.updatePosition());
  }

  private updatePosition() {
    if (!this.triggerElement || !this.elementRef.nativeElement) {
      return;
    }

    const trigger = this.triggerElement.getBoundingClientRect();
    const popover = this.elementRef.nativeElement.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Position initiale (centrée sous le trigger)
    let left = trigger.left + (trigger.width / 2);
    let top = trigger.bottom + 8; // 8px de marge
    let transform = 'translate(-50%, 0)';

    // Vérifier si le popover dépasse à droite
    if (left + (popover.width / 2) > viewport.width) {
      left = viewport.width - 16; // 16px de marge
      transform = 'translate(-100%, 0)';
    }
    // Vérifier si le popover dépasse à gauche
    if (left - (popover.width / 2) < 0) {
      left = 16; // 16px de marge
      transform = 'translate(0, 0)';
    }

    // Vérifier si le popover dépasse en bas
    if (top + popover.height > viewport.height) {
      // Positionner au-dessus du trigger
      top = trigger.top - popover.height - 8;
      // Inverser la flèche
      this.elementRef.nativeElement.classList.add('arrow-bottom');
    } else {
      this.elementRef.nativeElement.classList.remove('arrow-bottom');
    }

    // Appliquer les positions
    this.position = {
      top: `${top}px`,
      left: `${left}px`,
      transform
    };

    // Forcer l'application des styles
    Object.assign(this.elementRef.nativeElement.style, {
      top: this.position.top,
      left: this.position.left,
      transform: this.position.transform
    });
  }

  ngOnInit() {
    console.log('[Filter] Initializing popover with values:', this.values);
    this.filteredValues = [...this.values];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['values'] && !changes['values'].firstChange) {
      console.log('[Filter] Values changed:', changes['values'].currentValue);
      this.filteredValues = [...changes['values'].currentValue];
    }
  }

  onSearch(term: string) {
    this.searchTerm = term;
    this.filteredValues = this.values.filter(value => 
      value.toLowerCase().includes(term.toLowerCase())
    );
  }

  toggleValue(value: string) {
    const newSelection = new Set(this.selectedValues);
    if (newSelection.has(value)) {
      newSelection.delete(value);
    } else {
      newSelection.add(value);
    }
    this.selectedValues = newSelection;
    this.filterChange.emit(newSelection);
  }

  selectAll() {
    const newSelection = new Set(this.filteredValues);
    this.selectedValues = newSelection;
    this.filterChange.emit(newSelection);
  }

  deselectAll() {
    this.selectedValues.clear();
    this.filterChange.emit(new Set());
  }
} 