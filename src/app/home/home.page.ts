import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { Map, tileLayer, marker, icon } from 'leaflet';
import { Http } from '@angular/http';
import { map } from 'rxjs/operators';
import { PathService } from '../shared/services/path.service';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { PreferitiService } from '../shared/services/preferiti.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  point: { lng: any; lat: any; };

  pointsPath=[];

  map: Map

  
  paths = {
    "0": {
      "value": 0,
      "name": "Car"
    },
    "1": {
      "value": 1,
      "name": "Foot"
    },
    "2": {
      "value": 2,
      "name": "Bycicle"
    },
    "3": {
      "value": 3,
      "name": "Car by Speed"
    },
    "4": {
      "value": 4,
      "name": "Fitness"
    },
    "5": {
      "value": 5,
      "name": "Bycicle co2"
    },
    "6":{
      "value": 6,
      "name": "Anziani"
    },
    "7":{
      "value":7,
      "name":"Famiglie"
    },
    "8":{
      "value":8,
      "name":"Turistico"
    }
  }


  constructor(public http: Http,
            public plt: Platform,
            public router: Router,
            public preferitiService: PreferitiService,
            private localNotifications: LocalNotifications) {

            }

  setTypePAth(){

    this.router.navigate(["/tabs/map"]);
  }

  single_notification() {
    // Schedule a single notification
    
    const now= new Date()
    const trigger = new Date()
    trigger.setDate(now.getDate()+1)
    
    trigger.setMinutes(now.getMinutes()+3)
    this.localNotifications.schedule({
      id: 1,
      text: 'Single ILocalNotification',
      data: { secret: 'key_data' },
      trigger: {at: trigger},
      smallIcon: 'assets://bb/icon3-m.png',
      sound:  'file://sound.mp3',
    });
  }

  goToProfile(){

    this.router.navigate(["/tabs/profilo"]);
  }

  goToPreferiti(item){
    this.preferitiService.setPeriti(this.paths[item])
    this.router.navigate(["/tabs/path"]);
  }

  goToPoisView(){

    this.router.navigate(["/tabs/pois_view"]);
  }
}
