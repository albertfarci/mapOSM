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
import { IfStmt } from '@angular/compiler';
import { longStackSupport } from 'q';
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
    }),
    monument: icon({
      iconUrl: '/assets/release1/monument.svg',
      iconSize: [25, 25],
      popupAnchor: [0, -20]
    }),
    museum: icon({
      iconUrl: '/assets/release1/museum.svg',
      iconSize: [25, 25],
      popupAnchor: [0, -20]
    }),
    restaurant: icon({
      iconUrl: '/assets/release1/restaurant.svg',
      iconSize: [25, 25],
      popupAnchor: [0, -20]
    }),
    shop: icon({
      iconUrl: '/assets/release1/shop.svg',
      iconSize: [25, 25],
      popupAnchor: [0, -20]
    })
  }

  tracker
  start= []
  navigazioneAttiva
  poisList = []
  pointsPath : Array<Point>=[]
  currentFilter
  layerGroup
  map: Map
  constructor(
    public plt: Platform,
    public router: Router,
    public pathService: PathService,
    public geoLocationService: GeoLocationService,
    public dettaglioPreferitoService: DettaglioPreferitoService,
    private sqlite: SQLite,
    private toast: Toast,
  ) {
  }

  ionViewWillLeave(){

    this.navigazioneAttiva=true
    clearInterval(this.tracker)
  }
  ionViewWillEnter() {
    
    this.plt.ready().then(() => {
      
      if (this.map) {
        this.map.removeLayer(this.layerGroup);
        this.map.remove()
      }
      
      this.navigazioneAttiva=true

      this.initMap()
      
      
      this.sqlite.create({
        name: 'filters.db',
        location: 'default'
      })
        .then((db: SQLiteObject) => {
          
          db.executeSql(`select * from paths`,[])
          .then((tableSelect)=>{
            
            if (tableSelect.rows.length > 0) {
              for (var i = 0; i < tableSelect.rows.length; i++) {
                
                
                if(tableSelect.rows.item(i).rowid == this.dettaglioPreferitoService.dettaglioPreferito.id){
                  
                  this.pointsPath[0]={
                    latitudine:JSON.parse(tableSelect.rows.item(i).coordinates)[0].lat,
                    longitudine: JSON.parse(tableSelect.rows.item(i).coordinates)[0].lng
                  }
                  
                  this.layerGroup.addLayer(marker([this.pointsPath[0].latitudine,this.pointsPath[0].longitudine], {icon: this.icons.puntoA}));
                  
                  this.pointsPath[1]={
                    latitudine:JSON.parse(tableSelect.rows.item(i).coordinates)[1].lat,
                    longitudine:JSON.parse(tableSelect.rows.item(i).coordinates)[1].lng
                  }
                  this.layerGroup.addLayer(marker([this.pointsPath[1].latitudine, this.pointsPath[1].longitudine], {icon: this.icons.puntoB}));
                  
                  this.currentFilter=JSON.parse(tableSelect.rows.item(i).filter)
                  
                }
                
              }
              
            }
          })
          .catch((e) => {
            this.toast.show(JSON.stringify(e), '3000', 'center').subscribe(
              toast => {
                console.log(toast);
            })
          })
        })
     });
  }

  displayPointOnMap(){

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
        resp =>{

            if(this.pointsPath[0]){
              if(this.pointsPath[0].latitudine!=resp.latitudine && 
                this.pointsPath[0].longitudine!=resp.longitudine){
                  
                  this.map.removeLayer(this.layerGroup)
                  this.layerGroup = new LayerGroup();
                  this.layerGroup.addTo(this.map);
                  this.layerGroup.addLayer(marker([resp.latitudine, resp.longitudine], { icon: this.icons.puntoA }));
                  
                  this.map.setView([resp.latitudine, resp.longitudine], 16);
                  //this.getPath(resp,{latitudine:"39.21834898953833",longitudine:"9.1126227435" }as Point)
                  this.getPath(resp)
                  this.getPoiNearToPoint(resp)
                  
                  //this.getPoiNearToPoint({latitudine:"39.21477",longitudine:"9.11289" }as Point)
                
                this.pointsPath[0]=resp
              }
            }else{
              this.map.removeLayer(this.layerGroup)
                this.layerGroup = new LayerGroup();
                this.layerGroup.addTo(this.map);
                this.layerGroup.addLayer(marker([resp.latitudine, resp.longitudine], { icon: this.icons.puntoA }));
                
                this.map.setView([resp.latitudine, resp.longitudine], 16);
                //this.getPath(resp,{latitudine:"39.21834898953833",longitudine:"9.1126227435" }as Point)
                this.getPath(resp)
                this.getPoiNearToPoint(resp)
                
                //Athis.getPoiNearToPoint({latitudine:"39.21477",longitudine:"9.11289" }as Point)
              
              this.pointsPath[0]=resp
            }
            
            
      }
    )
  }

  getPoiNearToPoint(currentPoint: Point){
        
        this.pathService.getPOIsNearToPoint(currentPoint,1)
        .subscribe(
          resp => {
            if(resp.list_nodes){
              
              this.start=[]
              resp.list_nodes.map(x=> {
                
                this.layerGroup.addLayer(marker([x.lat, x.lon], { icon: this.icons.restaurant }).bindPopup('<h5>' + x.tags.name + '</h5>'));
                
                this.start.push({
                  icon: "/assets/release1/restaurant.svg",
                  item: x
                })
              })
            }
            
          }
        )

        this.pathService.getPOIsNearToPoint(currentPoint,2)
        .subscribe(
          resp => {
            if(resp.list_nodes){
              
              this.start=[]
              resp.list_nodes.map(x=> {
                
                this.layerGroup.addLayer(marker([x.lat, x.lon], { icon: this.icons.shop }).bindPopup('<h5>' + x.tags.name + '</h5>'));
                
                this.start.push({
                  icon: "/assets/release1/shop.svg",
                  item: x
                })
              })
            }
            
          }
        )

        this.pathService.getPOIsNearToPoint(currentPoint,3)
        .subscribe(
          resp => {
            if(resp.list_nodes){
              
              this.start=[]
              resp.list_nodes.map(x=> {
                
                this.layerGroup.addLayer(marker([x.lat, x.lon], { icon: this.icons.museum }).bindPopup('<h5>' + x.tags.name + '</h5>'));
                
                this.start.push({
                  icon: "/assets/release1/museum.svg",
                  item: x
                })
              })
            }
            
          }
        )

        this.pathService.getPOIsNearToPoint(currentPoint,4)
        .subscribe(
          resp => {
            if(resp.list_nodes){
              
              this.start=[]
              resp.list_nodes.map(x=> {
                
                this.layerGroup.addLayer(marker([x.lat, x.lon], { icon: this.icons.monument }).bindPopup('<h5>' + x.tags.name + '</h5>'));
                
                this.start.push({
                  icon: "/assets/release1/monument.svg",
                  item: x
                })
              })
            }
            
          }
        )
        
        console.log(this.start)
      
  }

  getPath(start?: Point, end?: Point){
    var point=start.latitudine+","+start.longitudine
    //var point="39.21477,9.11289"
    if(end){
      var pointEnd=end.latitudine+","+end.longitudine
    }else {
      var pointEnd=this.pointsPath[1].latitudine+","+this.pointsPath[1].longitudine
    }
    this.pathService.getPath(point,pointEnd, this.currentFilter.value)
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
        
      });
  }

  startTracking(){
    this.navigazioneAttiva=false
    
    this.geoLocationService.checkPermission=true
    if(this.geoLocationService.checkPermission == true){
      this.tracker = setInterval(() => {
        this.getLocationCoordinates()
      }, 1000);
    }else{
      this.geoLocationService.checkGPSPermission()
      this.tracker = setInterval(() => {
        this.getLocationCoordinates()
      }, 1000);
    }

  }

}   