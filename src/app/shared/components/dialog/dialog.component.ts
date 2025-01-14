import { Component, EventEmitter, Injector, Input, Output, Type } from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgComponentOutlet]
})
export class DialogComponent {
  @Input() title!: string;
  @Input() dialogClass?: string = 'max-w-2xl';
  @Input() content!: Type<any>;
  @Input() data: any;

  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  isOpen = false;

  constructor(public injector: Injector) {}

  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }

  onSave(result: any) {
    this.save.emit(result);
    this.close();
  }

  onCancel() {
    this.cancel.emit();
    this.close();
  }
} 