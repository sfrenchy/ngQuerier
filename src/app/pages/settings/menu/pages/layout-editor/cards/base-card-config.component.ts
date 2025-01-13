import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardDto } from '../../../../../../models/api.models';

@Component({
  selector: 'app-base-card-config',
  template: `
    <form [formGroup]="form" class="space-y-4">
      <!-- Configuration de base -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Titre</label>
          <input type="text" formControlName="title"
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Largeur (en colonnes)</label>
          <input type="number" formControlName="gridWidth" min="1" max="12"
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Couleur de fond</label>
          <input type="color" formControlName="backgroundColor"
                 class="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
        </div>
      </div>

      <!-- Configuration spécifique -->
      <ng-content></ng-content>

      <!-- Actions -->
      <div class="flex justify-end gap-2 pt-4 border-t">
        <button type="button" 
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                (click)="onCancel()">
          Annuler
        </button>
        <button type="submit" 
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                [disabled]="!form.valid"
                (click)="onSave()">
          Enregistrer
        </button>
      </div>
    </form>
  `,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export abstract class BaseCardConfigComponent implements OnInit {
  @Input() card!: CardDto;
  @Output() save = new EventEmitter<CardDto>();
  @Output() cancel = new EventEmitter<void>();

  protected form!: FormGroup;

  constructor(protected fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      title: [this.card.title, Validators.required],
      gridWidth: [this.card.gridWidth, [Validators.required, Validators.min(1), Validators.max(12)]],
      backgroundColor: [this.card.backgroundColor || '#ffffff', Validators.required],
      ...this.getSpecificControls()
    });
  }

  abstract getSpecificControls(): { [key: string]: any[] };

  onSave(): void {
    if (this.form.valid) {
      const updatedCard: CardDto = {
        ...this.card,
        ...this.form.value
      };
      this.save.emit(updatedCard);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
} 