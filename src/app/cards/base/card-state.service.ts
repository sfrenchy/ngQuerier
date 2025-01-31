@Injectable({
  providedIn: 'root'
})
export class CardStateService {
  private cardStates = new Map<string, BehaviorSubject<CardState>>();

  getCardState(cardId: string): Observable<CardState> {
    if (!this.cardStates.has(cardId)) {
      this.cardStates.set(cardId, new BehaviorSubject<CardState>({
        isEditing: false,
        isFullscreen: false,
        isDirty: false
      }));
    }
    return this.cardStates.get(cardId)!.asObservable();
  }

  updateCardState(cardId: string, update: Partial<CardState>) {
    const current = this.cardStates.get(cardId)?.value || {};
    this.cardStates.get(cardId)?.next({...current, ...update});
  }
}
