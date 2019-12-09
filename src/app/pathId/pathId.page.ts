import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Map, LeafIcon, tileLayer, marker, icon, polyline, geoJSON, removeLayers, LayerGroup } from 'leaflet';
import { Platform } from '@ionic/angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Toast } from '@ionic-native/toast/ngx';
import { PathService } from '../shared/services/path.service';
import { PoiService } from '../shared/services/poi.service';
import { DettaglioPreferitoService } from '../shared/services/dettaglioPreferito.service';
import { GeoLocationService } from '../shared/services/geoLocation.service';
import { map, timeout } from 'rxjs/operators';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { filter } from 'minimatch';
import { Point } from '../shared/models/point.model';
@Component({
  selector: 'app-pathId',
  templateUrl: 'pathId.page.html',
  styleUrls: ['pathId.page.scss']
})
export class PathIdPage {
  icons = {
    puntoA: icon({
      iconUrl: '/assets/release1/Oval.svg',
      iconSize: [25, 25],
      popupAnchor: [0, -20]
    }),
    puntoB: icon({
      iconUrl: '/assets/release1/OvalBlack.svg',
      iconSize: [25, 25],
      popupAnchor: [0, -20]
    })
  }

  tracker
  start= []
  navigazioneAttiva
  poisList = []
  pointsPath = []
  currentFilter
  layerGroup
  map: Map
  constructor(
    public plt: Platform,
    public router: Router,
    public pathService: PathService,
    public geoLocationService: GeoLocationService,
    public dettaglioPreferitoService: DettaglioPreferitoService
  ) {
  }


  ionViewWillEnter() {
    
    this.plt.ready().then(() => {
      
      if (this.map) {
        this.map.removeLayer(this.layerGroup);
        this.map.remove()
      }
      
      this.navigazioneAttiva=true

      this.initMap()
      
    });
  }


  initMap() {
    this.map = new Map('map-pathId').setView([39.21834898953833, 9.1126227435], 12.5);

    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);


    this.layerGroup = new LayerGroup();
    this.layerGroup.addTo(this.map);

    this.map.invalidateSize();
    
    
  }
  
  // Methos to get device accurate coordinates using device GPS
  getLocationCoordinates() {
    this.geoLocationService.getLocationCoordinates()
      .subscribe(
        resp =>{this.map.removeLayer(this.layerGroup)

            this.layerGroup = new LayerGroup();
            this.layerGroup.addTo(this.map);
            this.layerGroup.addLayer(marker([resp.latitudine, resp.longitudine], { icon: this.icons.puntoA }));
            
            this.getPath(resp)
      }
    )
  }


  getPath(start){
    var point=start.latitudine+","+start.longitudine
    
    this.pathService.getPath(point, "39.223921,9.110375", 1)
    .subscribe(
      posts => {
        let myStyle = {
          color: 'red',
          dashArray: "5 10",
          weight: 7,
          opacity: 0.65,
        };

        this.pathService.calculateGeometry(posts)
          .subscribe(
              geometryArray2Dim => {
                this.layerGroup.addLayer(geoJSON({
                  "type": "LineString",
                  "coordinates": geometryArray2Dim,
                  //}).bindPopup('<h1>'+this.currentFilter.name+'</h1>'));
                }, { style: myStyle }).bindPopup('<h1>Car</h1>'));
              }
          )
        
        this.pathService.getPOIsNearToPoint(start,1)
              .subscribe(
                resp => {
                  this.start=resp
                }
              )
      });
  }

  startTracking(){
    this.navigazioneAttiva=false
    
    //this.geoLocationService.checkPermission=false
    if(this.geoLocationService.checkPermission == true){
      this.tracker = setInterval(() => {
        this.getLocationCoordinates()
      }, 2000);
    }else{
      this.geoLocationService.checkGPSPermission()
      this.tracker = setInterval(() => {
        this.getLocationCoordinates()
      }, 2000);
    }

  }

  stopTracking(){
    
    this.navigazioneAttiva=true
    clearInterval(this.tracker)
  }

}   