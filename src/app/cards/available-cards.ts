import { Injectable, ApplicationRef, createComponent, EnvironmentInjector, Type } from '@angular/core';
import { getRegisteredCards } from '@cards/card.decorator';
import '@cards/pie-chart-card/pie-chart-card.component';
import '@cards/stacked-bar-and-lines-chart-card/stacked-bar-and-lines-chart.component';
import '@cards/line-chart-card/line-chart-card.component';
import '@cards/label-card/label-card.component';
import '@cards/data-table-card/data-table-card.component';

@Injectable({
  providedIn: 'root'
})
export class CardInitializerService {
  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {
  }

  initialize() {
    // Récupérer tous les composants décorés avec @Card
    const registeredCards = getRegisteredCards();

    // Créer une instance de chaque composant pour forcer leur inclusion
    registeredCards.forEach((cardComponent: Type<any>) => {
      // Créer le composant de manière imperceptible
      const componentRef = createComponent(cardComponent, {
        environmentInjector: this.injector,
        hostElement: document.createElement('div')
      });

      // Détruire immédiatement le composant
      componentRef.destroy();
    });
  }
}
