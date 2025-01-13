import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { LayoutEditorComponent } from './layout-editor.component';

@NgModule({
  declarations: [
    LayoutEditorComponent
  ],
  imports: [
    CommonModule,
    DragDropModule
  ],
  exports: [
    LayoutEditorComponent
  ]
})
export class LayoutEditorModule { } 