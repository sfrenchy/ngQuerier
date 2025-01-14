import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CardDto, BaseCardConfig } from '@models/api.models';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { CardService } from './card.service';
import { CardConfigService } from './card-config.service';
import { BaseCardConfigComponent } from './base-card-config.component';
import { Type } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-card-config-dialog',
  template: `
    <app-dialog title="Configuration de la carte">
      <ng-container *ngComponentOutlet="configComponent;
                    inputs: {
                      card: card
                    }">
      </ng-container>
    </app-dialog>
  `,
  standalone: true,
  imports: [CommonModule, DialogComponent, ReactiveFormsModule]
})
export class CardConfigDialogComponent implements OnInit, OnDestroy {
  @Input() card!: CardDto<BaseCardConfig>;
  @Output() save = new EventEmitter<CardDto<BaseCardConfig>>();
  @Output() cancel = new EventEmitter<void>();

  private subscriptions: Subscription[] = [];

  constructor(
    private cardService: CardService,
    public cardConfigService: CardConfigService
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.cardConfigService.save$.subscribe(card => this.save.emit(card)),
      this.cardConfigService.cancel$.subscribe(() => this.cancel.emit())
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  get configComponent(): Type<BaseCardConfigComponent> | null {
    return this.cardService.getConfigComponent(this.card.type);
  }
} 