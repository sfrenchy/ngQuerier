import {Component, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {CardInitializerService} from './cards/available-cards';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslateModule],
  template: '<router-outlet></router-outlet>'
})
export class AppComponent implements OnInit {
  title = 'ngQuerier';

  constructor(
    private cardInitializer: CardInitializerService
  ) {
  }

  ngOnInit() {
    // Initialiser les cartes au démarrage de l'application
    this.cardInitializer.initialize();
  }
}
