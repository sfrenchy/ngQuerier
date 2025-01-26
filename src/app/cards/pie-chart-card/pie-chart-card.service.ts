import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface PieChartState {
  // Add your state properties here
}

@Injectable({
  providedIn: 'root'
})
export class PieChartCardService {
  private stateMap = new Map<string, BehaviorSubject<PieChartState>>();

  constructor() {}

  private getStateKey(config: any): string {
    return JSON.stringify(config);
  }

  private getOrCreateState(config: any): BehaviorSubject<PieChartState> {
    const key = this.getStateKey(config);
    if (!this.stateMap.has(key)) {
      this.stateMap.set(key, new BehaviorSubject<PieChartState>({
        // Initialize your state here
      }));
    }
    return this.stateMap.get(key)!;
  }

  // Add your service methods here

  clearState(config: any): void {
    const key = this.getStateKey(config);
    this.stateMap.delete(key);
  }
} 