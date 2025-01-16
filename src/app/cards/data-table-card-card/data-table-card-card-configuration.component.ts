import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DataTableCardCardConfig } from './data-table-card-card.component';
import { CardDto } from '@models/api.models';

@Component({
  selector: 'app-data-table-card-card-configuration',
  templateUrl: './data-table-card-card-configuration.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule]
})
export class DataTableCardCardConfigurationComponent implements OnInit {
  @Input() card!: CardDto<DataTableCardCardConfig>;
  @Output() save = new EventEmitter<DataTableCardCardConfig>();
  @Output() configChange = new EventEmitter<DataTableCardCardConfig>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      // Ajoutez vos contrôles de formulaire ici
    });

    // Émettre les changements dès que le formulaire change
    this.form.valueChanges.subscribe((value: any) => {
      if (this.form.valid) {
        const config = new DataTableCardCardConfig(
          // Ajoutez les paramètres du constructeur ici
        );
        this.configChange.emit(config);
      }
    });
  }

  ngOnInit() {
    if (this.card.configuration) {
      this.form.patchValue({
        // Ajoutez vos propriétés de formulaire ici
      }, { emitEvent: false }); // Ne pas émettre lors de l'initialisation
    }
  }

  // Méthode pour la sauvegarde finale
  onSave() {
    if (this.form.valid) {
      const config = new DataTableCardCardConfig(
        // Ajoutez les paramètres du constructeur ici
      );
      this.save.emit(config);
    }
  }
} 