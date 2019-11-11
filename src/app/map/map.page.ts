import { Component } from '@angular/core';
import { Map,LeafIcon, tileLayer, marker, icon,polyline ,geoJSON, removeLayers, LayerGroup } from 'leaflet';
import { Platform, AlertController } from '@ionic/angular';
import { PathService } from '../shared/services/path.service';
import { FilterListService } from '../shared/services/filters.service';
import { Router } from '@angular/router';
import { PoiService } from '../shared/services/poi.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Toast } from '@ionic-native/toast/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';

import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
 

@Component({
  selector: 'app-map',
  templateUrl: 'map.page.html',
  styleUrls: ['map.page.scss']
})
export class MapPage {
  point: { lng: any; lat: any; };

  paths={"0":{"value":0,
  "name":"Car"},
  "1":{"value":1,
  "name":"Foot"},
  "2":{"value":2,
  "name":"Bycicle"},
  "3":{"value":3,
  "name":"Car by Speed"},
  "4":{"value":4,
  "name":"Foot co2"},
  "5":{"value":5,
  "name":"Bycicle co2"}}

  formCrationPath : FormGroup;
  layerGroup 
  geoJson=[]
  pointsPath=[]
  map: Map
  onPathSelected=false
  pointB;
  fitlerActive

  pathCreated=[]

  endPoints=[]

  pathIsCreated: boolean = false;
  savePath : boolean = false;
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
  
  locationCoords: any;
  timetest: any;

  setAlarmBool: boolean=false
  timeSelected:any
  isSetAlertSelectedItem: boolean;


  constructor(
    public plt: Platform,
    public pathService: PathService,
    public filterListService: FilterListService,
    public router: Router,
    private formBuilder: FormBuilder,
    private poiService: PoiService,
    private sqlite: SQLite,
    private toast: Toast,
    private androidPermissions: AndroidPermissions,
    private geolocation: Geolocation,
    private locationAccuracy: LocationAccuracy,
    private localNotifications: LocalNotifications,
    public alertCtrl: AlertController) {

      
      this.locationCoords = {
        latitude: "",
        longitude: "",
        accuracy: "",
        timestamp: ""
      }
      this.timetest = Date.now();
      this.formCrationPath = this.formBuilder.group({
        arrivo: [null,Validators.required]
      });
    }

  ionViewDidEnter(){

    this.plt.ready().then(() => {
      /*
   this.sqlite.create({
    name: 'filters.db',
    location: 'default'
  })
    .then((db: SQLiteObject) => {
      db.executeSql(`DROP TABLE paths`,[])
      .then((tableInserted)=>{
        this.toast.show("TABLE DROPPED", '3000', 'center').subscribe(
          toast => {
            console.log(toast);
        })
      })
    })*/
      if(this.map) {
        this.map.removeLayer(this.layerGroup);
        this.pointsPath=[]
        this.map.remove()
        this.pathIsCreated=false
        this.savePath=false
        this.onPathSelected=false
        this.pathCreated=[]
        this.isSetAlertSelectedItem=false
        this.setAlarmBool=false
      }
      this.initMap()
    });
  }
  
  initMap() {
    this.map = new Map('map-page').setView([39.21834898953833,9.1126227435], 12.5);

    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);


    this.layerGroup = new LayerGroup();
    this.layerGroup.addTo(this.map);

    this.map.invalidateSize();
    this.map.on('click', (e)=>{
      this.onMapClick(e)
    });

    JSON.parse(this.poiService.getMonuments())
          .default
          .map(x => this.endPoints.push(x))
          
  }

  onMapClick(e) {
    if(!this.pointsPath[0]){
      
      this.layerGroup.addLayer(marker([e.latlng.lat, e.latlng.lng], {icon: this.icons.greenIcon}));
              
      this.pointsPath[0]={lat: e.latlng.lat, lng: e.latlng.lng}
    }else if(!this.pointsPath[1]){
      
      this.layerGroup.addLayer(marker([e.latlng.lat, e.latlng.lng], {icon: this.icons.redIcon}));
              
      this.pointsPath[1]={lat: e.latlng.lat, lng: e.latlng.lng}

    }
    if(this.pointsPath[0] && this.pointsPath[1]) this.pathIsCreated= true;
    
  }

  getShowPath(){
    this.map.fitBounds([
      [this.pointsPath[0].lat, this.pointsPath[0].lng],
      [this.pointsPath[1].lat, this.pointsPath[1].lng]
    ]);
    let pointStart= this.pointsPath[0].lat + "," +this.pointsPath[0].lng
    let pointEnd= this.pointsPath[1].lat + "," +this.pointsPath[1].lng
    const elements = Object.keys(this.paths)
    for (let index = 0; index < Object.keys(this.paths).length; index++) {
      //console.log(this.filterListService.getFilterObject()[index])
      
      //const element = this.filterListService.getFilterObject()[index];
      this.pathService.getPath(pointStart,pointEnd, elements[index])
      .subscribe(
          posts => {
            let newGeometry = posts.geometry.replace("[","");
            newGeometry = newGeometry.replace("]","");
            newGeometry = newGeometry.replace(/ /g,"|");
            newGeometry = newGeometry.replace("|","");	
        
            // 2. split sulle virgole:
            let geometryArray1Dim = newGeometry.split(",");    
        
            // 3. crea array bidimesionale:
            let geometryArray2Dim = Array.from(Array(geometryArray1Dim.length), () => new Array(2));
        
            // 4. popola array: per ogni elemento del precedente array, split su |:    
            for(let i=0; i<geometryArray1Dim.length; i++)
            {
              let tempArray = geometryArray1Dim[i].split("|");
              for(let j=0; j<2; j++)
              {
                geometryArray2Dim[i][0] = parseFloat(tempArray[0]);
                geometryArray2Dim[i][1] = parseFloat(tempArray[1]);
              }
            }
  
            let newPointList = posts.nodes.replace("[","");
            newPointList = newPointList.replace("]","");
        
            // 2. split sulle virgole:
            let PointList1Dim = newPointList.split(",");
  
            this.geoJson.push(geoJSON({
              "type": "LineString", 
              "coordinates": geometryArray2Dim,
            }))

            geoJSON({
              "type": "LineString", 
              "coordinates": geometryArray2Dim,
            })
          
            this.layerGroup.addLayer(geoJSON({
              "type": "LineString", 
              "coordinates": geometryArray2Dim,
            }));

            this.pathCreated.push({
              "filter": this.paths[elements[index]],
              "type": "LineString", 
              "coordinates": geometryArray2Dim
            })
            this.savePath=true
            this.pathIsCreated=false
          },
          error => {
            
          });
    }

  }

  savePathNavigate(){

    if(this.setAlarmBool && !this.isSetAlertSelectedItem){
      console.log("Now")
    }else{
      // Schedule a single notification
      // Schedule a single notification
      this.localNotifications.schedule({
        id: 1,
        text: 'Single ILocalNotification',
        sound:  'file://sound.mp3',
        data: { secret: "key" }
      });

      console.log(this.timeSelected.split("T")[1].split(".")[0])
    }
    
    this.sqlite.create({
      name: 'filters.db',
      location: 'default'
    })
      .then((db: SQLiteObject) => {
        db.executeSql(`CREATE TABLE IF NOT EXISTS paths(
          rowid INTEGER PRIMARY KEY, 
          filter TEXT,
          coordinates TEX)`,[])
        .then((tableInserted)=>{
          db.executeSql(`
            INSERT INTO paths (filter,coordinates)
              VALUES(?,?)`, [JSON.stringify(this.fitlerActive.filter),JSON.stringify(this.pointsPath)])
          .then((tableInserted)=>{
            this.toast.show("Percorso salvato", '3000', 'center').subscribe(
              toast => {
                console.log(toast);
            })
            this.router.navigate(['/tabs/home']);
          })
        })
        .catch((e) => {
          this.toast.show(JSON.stringify(e), '3000', 'center').subscribe(
            toast => {
              console.log(toast);
          })
        })
      })
    
   
   //console.log(this.pointsPath)
  }

  pathSelected($event){

    this.map.removeLayer(this.layerGroup)
    
    this.layerGroup = new LayerGroup();
    this.layerGroup.addTo(this.map);
    
    this.layerGroup.addLayer(marker([this.pointsPath[0].lat, this.pointsPath[0].lng], {icon: this.icons.greenIcon}));
    this.layerGroup.addLayer(marker([this.pointsPath[1].lat, this.pointsPath[1].lng], {icon: this.icons.redIcon}));
    
    //this.map.clearLayers()

    this.pathCreated.filter(x => x.filter.value == $event.detail.value)
    .map(x => {

      this.fitlerActive=x
      this.onPathSelected=true
      this.layerGroup.addLayer(geoJSON({
              "type": "LineString", 
              "coordinates": x.coordinates,
            }).bindPopup('<h1>'+x.filter.name+'</h1>'));
    })
  }

  setAlarm(){
    this.onPathSelected=false;
    this.savePath=false;
    
    this.setAlarmBool=true;
    this.timeSelected=undefined
  }

  isSetAlertSelected(){
    console.log("isSetAlertSelected")
    
    this.isSetAlertSelectedItem=!this.isSetAlertSelectedItem
  }

  itemSelected($event){
    
    if(!this.pointsPath[1]){

      this.endPoints
      .filter(x => x._id == $event.detail.value)
      .map(x =>{
        
        this.layerGroup.addLayer(marker([x.lat, x.long], {icon: this.icons.redIcon}));
        this.pointB=marker([x.lat, x.long], {icon: this.icons.redIcon})
        
        this.pointsPath[1]={lat: x.lat, lng: x.long}
      })

    }

    if(this.pointsPath[0] && this.pointsPath[1]) this.pathIsCreated= true;
      
  }

  setTimeAlert(){
    console.log(this.timeSelected)
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
        
      if(!this.pointsPath[0]){
        
        this.layerGroup.addLayer(marker([resp.coords.latitude, resp.coords.longitude], {icon: this.icons.greenIcon}));
                
        this.map.setView([resp.coords.latitude, resp.coords.longitude], 10);

        this.pointsPath[0]={lat: resp.coords.latitude, lng: resp.coords.longitude}
      }
      
      if(this.pointsPath[0] && this.pointsPath[1]) this.pathIsCreated= true;
     }).catch((error) => {
       console.log('Error getting location', error);
     });
  }
 

}
