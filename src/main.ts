import 'reflect-metadata';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { CardInitializerService } from './app/cards/available-cards';

bootstrapApplication(AppComponent, appConfig)
  .then(appRef => {
    // Initialiser les cartes
    const cardInitializer = appRef.injector.get(CardInitializerService);
    cardInitializer.initialize();
  })
  .catch((err) => console.error(err));
