import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-operation-status',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './operation-status.component.html',
  styleUrls: ['./operation-status.component.scss']
})
export class OperationStatusComponent {
  @Input() status: string = '';
  @Input() error?: string;
} 