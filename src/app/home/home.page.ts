import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { Map, tileLayer, marker, icon } from 'leaflet';
import { Http } from '@angular/http';
import { map } from 'rxjs/operators';
import { PathService } from '../shared/services/path.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  point: { lng: any; lat: any; };

  pointsPath=[];

  map: Map

  constructor(public http: Http,
            public plt: Platform,
            public router: Router) {

            }

  setTypePAth(){

    this.router.navigate(["/tabs/filters"]);
  }

  goToProfile(){

    this.router.navigate(["/tabs/profilo"]);
  }

  goToPreferiti(){

    this.router.navigate(["/tabs/path"]);
  }

  goToPoisView(){

    this.router.navigate(["/tabs/pois_view"]);
  }
}
