import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PlaceholderCardConfig } from '@models/api.models';
import { BaseCardConfigComponent } from './base-card-config.component';

@Component({
  selector: 'app-placeholder-card-config',
  template: `
    <div [formGroup]="form">
      <div formGroupName="configuration">
        <div>
          <label class="block text-sm font-medium mb-2">{{'CARD.CONFIG.SPECIFIC.PLACEHOLDER.LABEL' | translate}}</label>
          <div>
            <input type="text" [formControl]="labelControl"
                   class="block w-full h-11 rounded-md bg-[#25262b] border-0 text-gray-100
                          ring-1 ring-inset ring-[#373A40] focus:ring-2 focus:ring-inset focus:ring-blue-500
                          transition duration-150 ease-in-out text-base"
                   [placeholder]="'CARD.CONFIG.SPECIFIC.PLACEHOLDER.LABEL_PLACEHOLDER' | translate">
            <p class="mt-2 text-sm text-gray-400">
              {{'CARD.CONFIG.SPECIFIC.PLACEHOLDER.LABEL_HELP' | translate}}
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule]
})
export class PlaceholderCardConfigComponent extends BaseCardConfigComponent<PlaceholderCardConfig> implements OnInit {
  labelControl = new FormControl('');

  override ngOnInit() {
    super.ngOnInit();
    
    // Récupérer le groupe de configuration
    const configGroup = this.form.get('configuration') as FormGroup;
    if (configGroup) {
      // Ajouter le contrôle label
      configGroup.addControl('label', this.labelControl);
      
      // Initialiser avec la valeur existante si elle existe
      if (this.card?.configuration?.label) {
        this.labelControl.setValue(this.card.configuration.label);
      }
    }
  }
} 