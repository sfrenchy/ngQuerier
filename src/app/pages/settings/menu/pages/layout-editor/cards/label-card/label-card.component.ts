import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardDto } from '@models/api.models';
import { Card } from '../card.decorator';
import { LabelCardConfigurationComponent } from './label-card-configuration.component';

export interface LabelCardDto {
  label: string;
}

@Card({
  type: LabelCardComponent,
  configComponent: LabelCardConfigurationComponent,
  name: 'LabelCard',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
  </svg>`
})
@Component({
  selector: 'app-label-card',
  templateUrl: './label-card.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class LabelCardComponent {
  @Input() card!: CardDto;
  @Input() config?: LabelCardDto;
} 