import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: [],
  standalone: true,
  imports: [CommonModule]
})
export class TileComponent {
  @Input() title!: string;
  @Input() expanded = false;

  toggle() {
    this.expanded = !this.expanded;
  }
} 