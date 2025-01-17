import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface LineChartCardState {
  // Add your state properties here
}

@Injectable({
  providedIn: 'root'
})
export class LineChartCardCardService {
  private stateMap = new Map<string, BehaviorSubject<LineChartCardState>>();

  constructor() {}

  private getStateKey(config: any): string {
    return JSON.stringify(config);
  }

  private getOrCreateState(config: any): BehaviorSubject<LineChartCardState> {
    const key = this.getStateKey(config);
    if (!this.stateMap.has(key)) {
      this.stateMap.set(key, new BehaviorSubject<LineChartCardState>({
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