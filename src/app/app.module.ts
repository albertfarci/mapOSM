import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpModule } from '@angular/http';
import { PathService } from './shared/services/path.service';
import { FilterListService } from './shared/services/filters.service';
import { HttpClientModule } from '@angular/common/http';
import { DatePicker } from '@ionic-native/date-picker/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Toast } from '@ionic-native/toast/ngx';
import { PoiService } from './shared/services/poi.service';

import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { SharedModule } from './shared/shared.module';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx'

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpModule,HttpClientModule,SharedModule ],
  providers: [
    SQLite, 
    Toast,
    DatePicker,
    StatusBar,
    SplashScreen,
    PathService,
    FilterListService,
    PoiService,
    AndroidPermissions,
    Geolocation,
    LocationAccuracy,
    LocalNotifications,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
