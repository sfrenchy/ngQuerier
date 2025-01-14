import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ViewContainerRef, ComponentRef, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseCardComponent } from './base-card.component';
import { CardDto, BaseCardConfig } from '@models/api.models';

@Component({
  selector: 'app-card-wrapper',
  template: `<ng-container #container></ng-container>`,
  standalone: true,
  imports: [CommonModule]
})
export class CardWrapperComponent implements OnInit {
  @Input() component: Type<BaseCardComponent> | null = null;
  @Input() card!: CardDto<any>;
  @Input() config: BaseCardConfig = {} as BaseCardConfig;
  @Output() delete = new EventEmitter<void>();
  @Output() configurationChange = new EventEmitter<CardDto<any>>();

  @ViewChild('container', { read: ViewContainerRef, static: true })
  container!: ViewContainerRef;

  private componentRef?: ComponentRef<BaseCardComponent>;

  ngOnInit() {
    if (this.component) {
      this.componentRef = this.container.createComponent(this.component);
      this.componentRef.instance.card = this.card;
      this.componentRef.instance.config = this.config;
      this.componentRef.instance.delete.subscribe(() => this.delete.emit());
      this.componentRef.instance.configurationChange.subscribe(card => this.configurationChange.emit(card));
    }
  }
} 