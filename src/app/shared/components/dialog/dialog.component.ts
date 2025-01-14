import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  standalone: true,
  imports: [CommonModule, TranslateModule]
})
export class DialogComponent {
  @Input() title!: string;
  @Input() dialogClass?: string = 'max-w-2xl';
} 