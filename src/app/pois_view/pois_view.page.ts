import { Component } from '@angular/core';
import { Map,LeafIcon, tileLayer, marker, icon,polyline ,geoJSON, removeLayers, LayerGroup } from 'leaflet';
import { Platform } from '@ionic/angular';
import { PoiService } from '../shared/services/poi.service';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Component({
    selector: 'app-pois_view',
    templateUrl: 'pois_view.page.html',
    styleUrls: ['pois_view.page.scss']
  })
  export class PoisViewPage {
      
    icons= {
      greenIcon : icon({
        iconUrl: '/assets/pref-2/green-s.png',
        iconSize: [25, 25], 
        popupAnchor: [0, -20]
      }),
      redIcon : icon({
        iconUrl: '/assets/pref-2/red-s.png',
        iconSize: [25, 25],  
        popupAnchor: [0, -20]
      })
    }
    poisList=[]
    layerGroup 
    map: Map
    constructor(
      private poiService: PoiService,
      public plt: Platform,
      private androidPermissions: AndroidPermissions,
      private geolocation: Geolocation,
      private locationAccuracy: LocationAccuracy){}

    ionViewDidEnter(){
      
      this.plt.ready().then(() => {
        if(this.map) {
          this.map.removeLayer(this.layerGroup);
          this.map.remove()
        }
        this.initMap()
      });
    }
    
    initMap() {
      
      this.map = new Map('map-poi').setView([39.21834898953833,9.1126227435], 12.5);

      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);


      this.layerGroup = new LayerGroup();
      this.layerGroup.addTo(this.map);

      this.map.invalidateSize();
      
      JSON.parse(this.poiService.getMonuments())
            .default
            .map(e => {
              this.layerGroup.addLayer(marker([e.lat, e.long], {icon: this.icons.redIcon}));
              this.poisList.push(e)
            })

      JSON.parse(this.poiService.getArcheoSites())
            .default
            .map(e => {
              this.layerGroup.addLayer(marker([e.lat, e.long], {icon: this.icons.redIcon}));
              this.poisList.push(e)
            })
      
      JSON.parse(this.poiService.getGardens())
            .default
            .map(e => {
              this.layerGroup.addLayer(marker([e.lat, e.long], {icon: this.icons.redIcon}));
              this.poisList.push(e)
            })

      JSON.parse(this.poiService.getRestaurants())
            .default
            .map(e => {
              this.layerGroup.addLayer(marker([e.latitude, e.longitude], {icon: this.icons.redIcon}));
              this.poisList.push(e)
            })
      
      JSON.parse(this.poiService.getMuseums())
            .default
            .map(e => {
              this.layerGroup.addLayer(marker([e.lat, e.long], {icon: this.icons.redIcon}));
              this.poisList.push(e)
            })

      this.checkGPSPermission()
            
    }

    
  //Check if application having GPS access permission  
  checkGPSPermission() {
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
      result => {
        if (result.hasPermission) {
 
          //If having permission show 'Turn On GPS' dialogue
          this.askToTurnOnGPS();
        } else {
 
          //If not having permission ask for permission
          this.requestGPSPermission();
        }
      },
      err => {
        alert(err);
      }
    );
  }
 
  requestGPSPermission() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        console.log("4");
      } else {
        //Show 'GPS Permission Request' dialogue
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
          .then(
            () => {
              // call method to turn on GPS
              this.askToTurnOnGPS();
            },
            error => {
              //Show alert if user click on 'No Thanks'
              alert('requestPermission Error requesting location permissions ' + error)
            }
          );
      }
    });
  }
 
  askToTurnOnGPS() {
    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
      () => {
        // When GPS Turned ON call method to get Accurate location coordinates
        this.getLocationCoordinates()
      },
      error => alert('Error requesting location permissions ' + JSON.stringify(error))
    );
  }
 
  // Methos to get device accurate coordinates using device GPS
  getLocationCoordinates() {
    
    this.geolocation.getCurrentPosition().then((resp) => {
        
        this.layerGroup.addLayer(marker([resp.coords.latitude, resp.coords.longitude], {icon: this.icons.greenIcon}));
                
        this.map.setView([resp.coords.latitude, resp.coords.longitude], 10);

      }).catch((error) => {
       console.log('Error getting location', error);
     });
  }
 
  }