import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });


    this.platform.backButton.subscribe(() => {
      if (window.location.pathname == "/tabs/home") {
        navigator['app'].exitApp();
      }
      if (window.location.pathname.includes("/tabs/search")) {
        this.router.navigate(['/tabs/map']);
      }

      if (window.location.pathname == "/tabs/map") {
        this.router.navigate(['/tabs/home']);

      }


      if (window.location.pathname.includes("/tabs/pathId")) {
        this.router.navigate(['/tabs/home']);
      }

    })
  }
}
