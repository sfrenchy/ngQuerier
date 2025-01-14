import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CardDto, BaseCardConfig } from '@models/api.models';

@Injectable({
  providedIn: 'root'
})
export class CardConfigService {
  saveSubject = new Subject<CardDto<BaseCardConfig>>();
  cancelSubject = new Subject<void>();

  save$ = this.saveSubject.asObservable();
  cancel$ = this.cancelSubject.asObservable();

  emitSave(card: CardDto<BaseCardConfig>) {
    this.saveSubject.next(card);
  }

  emitCancel() {
    this.cancelSubject.next();
  }
} 