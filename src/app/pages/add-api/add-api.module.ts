import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AddApiComponent } from './add-api.component';
import { LanguageSelectorModule } from '../../components/language-selector/language-selector.module';

@NgModule({
  declarations: [
    AddApiComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    LanguageSelectorModule
  ],
  exports: [
    AddApiComponent
  ]
})
export class AddApiModule { } 