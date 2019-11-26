import { Component } from '@angular/core';
import { Map, LeafIcon, tileLayer, marker, icon, polyline, geoJSON, removeLayers, LayerGroup } from 'leaflet';
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
import { post } from 'selenium-webdriver/http';


@Component({
  selector: 'app-map',
  templateUrl: 'map.page.html',
  styleUrls: ['map.page.scss']
})
export class MapPage {
  point: { lng: any; lat: any; };

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

  formCrationPath: FormGroup;
  layerGroup
  geoJson = []
  pointsPath = []
  map: Map
  onPathSelected = false
  pointB;
  fitlerActive

  pathFilter = []

  pathCreated = []

  endPoints = []

  pathIsCreated: boolean = false;
  savePath: boolean = false;
  icons = {
    greenIcon: icon({
      iconUrl: '/assets/pref-2/green-s.png',
      iconSize: [25, 25],
      popupAnchor: [0, -20]
    }),
    redIcon: icon({
      iconUrl: '/assets/pref-2/red-s.png',
      iconSize: [25, 25],
      popupAnchor: [0, -20]
    })
  }

  locationCoords: any;
  timetest: any;

  setAlarmBool: boolean = false
  timeSelected: any
  isSetAlertSelectedItem: boolean;
  optionsFilter: boolean = false;


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
      arrivo: [null, Validators.required]
    });
  }

  ionViewDidEnter() {

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
      this.pointsPath = []
      if (this.map) {
        this.map.removeLayer(this.layerGroup);
        this.map.remove()
        this.pathIsCreated = false
        this.savePath = false
        this.onPathSelected = false
        this.pathCreated = []
        this.isSetAlertSelectedItem = false
        this.setAlarmBool = false
      }
      this.initMap()
    });
  }

  initMap() {

    this.map = new Map('map-page').setView([39.21834898953833, 9.1126227435], 18);

    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);


    this.layerGroup = new LayerGroup();
    this.layerGroup.addTo(this.map);

    this.map.invalidateSize();

    JSON.parse(this.poiService.getMonuments())
      .default
      .map(x => {
        this.endPoints.push(x)
        console.log(x)
        this.layerGroup.addLayer(marker([x.lat, x.long], { title: x.label, icon: this.icons.greenIcon }).bindPopup('<h5>' + x.label + '</h5>').on('click', (x => {

          //this.layerGroup.addLayer(marker([x.latlng.lat, x.latlng.lng], {icon: this.icons.redIcon}));

          this.pointsPath[1] = { lat: x.latlng.lat, lng: x.latlng.lng, title: x.target.options.title }

        })))
      })



    //this.getLocationCoordinates()
    this.checkGPSPermission()

  }

  getShowPath() {

    this.savePath = true
    console.log(document.getElementById("bycicle"))
    //document.getElementById("car").style.background="blue"
    let pointStart = this.pointsPath[0].lat + "," + this.pointsPath[0].lng
    let pointEnd = this.pointsPath[1].lat + "," + this.pointsPath[1].lng
    const elements = Object.keys(this.paths)
    for (let index = 0; index < Object.keys(this.paths).length; index++) {
      //console.log(this.filterListService.getFilterObject()[index])

      //const element = this.filterListService.getFilterObject()[index];
      this.pathService.getPath(pointStart, pointEnd, elements[index])
        .subscribe(
          posts => {
            let newGeometry = posts.geometry.replace("[", "");
            newGeometry = newGeometry.replace("]", "");
            newGeometry = newGeometry.replace(/ /g, "|");
            newGeometry = newGeometry.replace("|", "");

            // 2. split sulle virgole:
            let geometryArray1Dim = newGeometry.split(",");

            // 3. crea array bidimesionale:
            let geometryArray2Dim = Array.from(Array(geometryArray1Dim.length), () => new Array(2));

            // 4. popola array: per ogni elemento del precedente array, split su |:    
            for (let i = 0; i < geometryArray1Dim.length; i++) {
              let tempArray = geometryArray1Dim[i].split("|");
              for (let j = 0; j < 2; j++) {
                geometryArray2Dim[i][0] = parseFloat(tempArray[0]);
                geometryArray2Dim[i][1] = parseFloat(tempArray[1]);
              }
            }

            let newPointList = posts.nodes.replace("[", "");
            newPointList = newPointList.replace("]", "");

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


            let icon
            let myStyle
            console.log(this.paths[elements[index]])
            if (this.paths[elements[index]].name == "Car" || this.paths[elements[index]].name == "Car by Speed") {
              console.log("car")
              icon = "/assets/icon/icon2-s.png"
              myStyle = {
                "color": "red",
                "weight": 5,
                "opacity": 0.65
              };

            }
            if (this.paths[elements[index]].name == "Bycicle" || this.paths[elements[index]].name == "Bycicle co2") {
              console.log("bicycle")
              icon = "/assets/icon/icon1-s.png"
              myStyle = {
                "color": "blue",
                "weight": 5,
                "opacity": 0.65
              };
            }
            if(this.paths[elements[index]].name == "Fitness"){
              console.log("fitness")
              icon = "/assets/icon/icon4-s.png"
              myStyle = {
                "color": "grey",
                "weight": 5,
                "opacity": 0.65
              };
            }
            if(this.paths[elements[index]].name == "Famiglie"){
              console.log("fitness")
              icon = "/assets/icon/icon5-s.png"
              myStyle = {
                "color": "white",
                "weight": 5,
                "opacity": 0.65
              };
            }
            if(this.paths[elements[index]].name == "Anziani"){
              console.log("fitness")
              icon = "/assets/icon/icon6-s.png"
              myStyle = {
                "color": "orange",
                "weight": 5,
                "opacity": 0.65
              };
            }
            if(this.paths[elements[index]].name == "Turistico"){
              console.log("fitness")
              icon = "/assets/icon/icon3-s.png"
              myStyle = {
                "color": "purple",
                "weight": 5,
                "opacity": 0.65
              };
            }
            if (this.paths[elements[index]].name == "Foot") {
              console.log("walk")
              icon = "/assets/icon/icon0-s.png"
              myStyle = {
                "color": "green",
                "weight": 5,
                "opacity": 0.65
              };
            }

            this.layerGroup.addLayer(geoJSON({
              "type": "LineString",
              "coordinates": geometryArray2Dim,
            }, { style: myStyle }));
            this.pathCreated.push({
              "filter": this.paths[elements[index]],
              "type": "LineString",
              "coordinates": geometryArray2Dim,
              "icon": icon,
              "duration": posts.duration,
              "distance":posts.distance
            })
            console.log(this.pathCreated)
            this.map.fitBounds([
              [this.pointsPath[0].lat, this.pointsPath[0].lng],
              [this.pointsPath[1].lat, this.pointsPath[1].lng]
            ]);
            this.savePath = true
            this.pathIsCreated = false
          },
          error => {

          });
    }

  }

  savePathNavigate(item) {
    console.log(item)
    document.getElementById(item.value).style.color="red"
    
    if (this.setAlarmBool && !this.isSetAlertSelectedItem) {
      this.localNotifications.schedule({
        id: 1,
        text: 'Single ILocalNotification',
        data: { secret: 'key_data' },
        smallIcon: 'assets://bb/icon3-m.png',
        sound: 'file://sound.mp3',
      });
    } else {
      const now = new Date()
      const trigger = new Date(this.timeSelected)
      if (trigger.getTime() > now.getTime()) {
        this.localNotifications.schedule({
          id: 1,
          text: 'Single ILocalNotification',
          data: { secret: 'key_data' },
          trigger: { at: trigger },
          smallIcon: 'assets://bb/icon3-m.png',
          sound: 'file://sound.mp3',
        });
      } else {
        trigger.setDate(now.getDate() + 1)
        this.localNotifications.schedule({
          id: 1,
          text: 'Single ILocalNotification',
          data: { secret: 'key_data' },
          trigger: { at: trigger },
          smallIcon: 'assets://bb/icon3-m.png',
          sound: 'file://sound.mp3',
        });
      }

      this.sqlite.create({
        name: 'filters.db',
        location: 'default'
      })
        .then((db: SQLiteObject) => {
          db.executeSql(`CREATE TABLE IF NOT EXISTS paths(
          rowid INTEGER PRIMARY KEY, 
          filter TEXT,
          coordinates TEX)`, [])
            .then((tableInserted) => {
              db.executeSql(`
            INSERT INTO paths (filter,coordinates)
              VALUES(?,?)`, [JSON.stringify(item), JSON.stringify(this.pointsPath)])
                .then((tableInserted) => {
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

    }
    //console.log(this.pointsPath)
  }

  carNamedColor = "light";
  walkNamedColor = "light";
  namedColor = "light";
  touristColor="light";
  fitnessColor="ligt";
  oldAgeColor="light";
  familyColor="light"

  carDisabled = false
  walkDisabled = false
  namedDisabled = false
  touristDisabled=false;
  fitnessDisabled=false;
  oldAgeDisabled=false;
  familyDisabled=false

  filterOptions() {
    if (this.optionsFilter) {
      this.optionsFilter = false
      
    } else {
      if(!(this.walkNamedColor == "secondary" || this.namedColor == "secondary")){
        
        this.namedDisabled=true
        this.walkDisabled=true
      }
      this.optionsFilter = true
    }
  }

  filterOldAge(){
    
    this.map.removeLayer(this.layerGroup)

    this.layerGroup = new LayerGroup();
    this.layerGroup.addTo(this.map);

    this.layerGroup.addLayer(marker([this.pointsPath[0].lat, this.pointsPath[0].lng], { icon: this.icons.greenIcon }));
    this.layerGroup.addLayer(marker([this.pointsPath[1].lat, this.pointsPath[1].lng], { icon: this.icons.redIcon }));

    if (this.oldAgeColor === 'light') {
      this.touristDisabled = true
      this.fitnessDisabled = true
      this.familyDisabled = true
      this.carDisabled=true
      this.walkDisabled = true
      this.namedDisabled = true
      this.oldAgeColor = 'secondary'
    } else {
      this.touristDisabled = false
      this.fitnessDisabled = false
      this.familyDisabled = false
      this.carDisabled=false
      this.walkDisabled = false
      this.namedDisabled = false
      this.oldAgeColor = "light"
    }

    if (this.pathFilter.length == 0) {
      this.pathFilter = this.pathCreated
      this.pathCreated = this.pathCreated
        .filter(x => {
          console.log(x.icon)
          return x.icon === "/assets/icon/icon6-s.png" 
        })
    } else {
      this.pathCreated = this.pathFilter
      this.pathFilter = []
    }


    this.pathCreated.map(x => {

      console.log(x)

      let icon
      let myStyle
      if (x.filter.name == "Car" || x.filter.name == "Car by Speed") {
        console.log("car")
        icon = "/assets/icon/icon2-s.png"
        myStyle = {
          "color": "red",
          "weight": 5,
          "opacity": 0.65
        };

      }
      if (x.filter.name== "Bycicle" || x.filter.name == "Bycicle co2") {
        console.log("bicycle")
        icon = "/assets/icon/icon1-s.png"
        myStyle = {
          "color": "blue",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if(x.filter.name == "Fitness"){
        console.log("fitness")
        icon = "/assets/icon/icon4-s.png"
        myStyle = {
          "color": "grey",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if(x.filter.name == "Famiglie"){
        console.log("fitness")
        icon = "/assets/icon/icon5-s.png"
        myStyle = {
          "color": "white",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if(x.filter.name == "Anziani"){
        console.log("fitness")
        icon = "/assets/icon/icon6-s.png"
        myStyle = {
          "color": "orange",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if(x.filter.name == "Turistico"){
        console.log("fitness")
        icon = "/assets/icon/icon3-s.png"
        myStyle = {
          "color": "purple",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if (x.filter.name == "Foot") {
        console.log("walk")
        icon = "/assets/icon/icon0-s.png"
        myStyle = {
          "color": "green",
          "weight": 5,
          "opacity": 0.65
        };
      }


      this.layerGroup.addLayer(geoJSON({
        "type": "LineString",
        "coordinates": x.coordinates,
      }, { style: myStyle }).bindPopup('<img src="' + icon + '">'));


    })
    console.log(this.layerGroup)
    console.log(this.pathCreated)
  }

  filterFitness(){
    
    this.map.removeLayer(this.layerGroup)

    this.layerGroup = new LayerGroup();
    this.layerGroup.addTo(this.map);

    this.layerGroup.addLayer(marker([this.pointsPath[0].lat, this.pointsPath[0].lng], { icon: this.icons.greenIcon }));
    this.layerGroup.addLayer(marker([this.pointsPath[1].lat, this.pointsPath[1].lng], { icon: this.icons.redIcon }));

    if (this.fitnessColor === 'light') {
      this.touristDisabled = true
      this.familyDisabled = true
      this.oldAgeDisabled = true
      this.carDisabled=true
      this.walkDisabled = true
      this.namedDisabled = true
      this.fitnessColor = 'secondary'
    } else {
      this.touristDisabled = false
      this.familyDisabled = false
      this.oldAgeDisabled = false
      this.carDisabled=false
      this.walkDisabled = false
      this.namedDisabled = false
      this.fitnessColor = "light"
    }

    if (this.pathFilter.length == 0) {
      this.pathFilter = this.pathCreated
      this.pathCreated = this.pathCreated
        .filter(x => {
          console.log(x.icon)
          return x.icon === "/assets/icon/icon4-s.png" 
        })
    } else {
      this.pathCreated = this.pathFilter
      this.pathFilter = []
    }


    this.pathCreated.map(x => {

      console.log(x)

      let icon
      let myStyle
      if (x.filter.name == "Car" || x.filter.name == "Car by Speed") {
        console.log("car")
        icon = "/assets/icon/icon2-s.png"
        myStyle = {
          "color": "red",
          "weight": 5,
          "opacity": 0.65
        };

      }
      if (x.filter.name== "Bycicle" || x.filter.name == "Bycicle co2") {
        console.log("bicycle")
        icon = "/assets/icon/icon1-s.png"
        myStyle = {
          "color": "blue",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if(x.filter.name == "Fitness"){
        console.log("fitness")
        icon = "/assets/icon/icon4-s.png"
        myStyle = {
          "color": "grey",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if(x.filter.name == "Famiglie"){
        console.log("fitness")
        icon = "/assets/icon/icon5-s.png"
        myStyle = {
          "color": "white",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if(x.filter.name == "Anziani"){
        console.log("fitness")
        icon = "/assets/icon/icon6-s.png"
        myStyle = {
          "color": "orange",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if(x.filter.name == "Turistico"){
        console.log("fitness")
        icon = "/assets/icon/icon3-s.png"
        myStyle = {
          "color": "purple",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if (x.filter.name == "Foot") {
        console.log("walk")
        icon = "/assets/icon/icon0-s.png"
        myStyle = {
          "color": "green",
          "weight": 5,
          "opacity": 0.65
        };
      }


      this.layerGroup.addLayer(geoJSON({
        "type": "LineString",
        "coordinates": x.coordinates,
      }, { style: myStyle }).bindPopup('<img src="' + icon + '">'));


    })
    console.log(this.layerGroup)
    console.log(this.pathCreated)
  }

  filterFamily(){

    this.map.removeLayer(this.layerGroup)

    this.layerGroup = new LayerGroup();
    this.layerGroup.addTo(this.map);

    this.layerGroup.addLayer(marker([this.pointsPath[0].lat, this.pointsPath[0].lng], { icon: this.icons.greenIcon }));
    this.layerGroup.addLayer(marker([this.pointsPath[1].lat, this.pointsPath[1].lng], { icon: this.icons.redIcon }));

    if (this.familyColor === 'light') {
      this.touristDisabled = true
      this.fitnessDisabled = true
      this.oldAgeDisabled = true
      this.carDisabled=true
      this.walkDisabled = true
      this.namedDisabled = true
      this.familyColor = 'secondary'
    } else {
      this.touristDisabled = false
      this.fitnessDisabled = false
      this.oldAgeDisabled = false
      this.carDisabled=false
      this.walkDisabled = false
      this.namedDisabled = false
      this.familyColor = "light"
    }

    if (this.pathFilter.length == 0) {
      this.pathFilter = this.pathCreated
      this.pathCreated = this.pathCreated
        .filter(x => {
          console.log(x.icon)
          return x.icon === "/assets/icon/icon5-s.png" 
        })
    } else {
      this.pathCreated = this.pathFilter
      this.pathFilter = []
    }


    this.pathCreated.map(x => {

      console.log(x)

      let icon
      let myStyle
      if (x.filter.name == "Car" || x.filter.name == "Car by Speed") {
        console.log("car")
        icon = "/assets/icon/icon2-s.png"
        myStyle = {
          "color": "red",
          "weight": 5,
          "opacity": 0.65
        };

      }
      if (x.filter.name== "Bycicle" || x.filter.name == "Bycicle co2") {
        console.log("bicycle")
        icon = "/assets/icon/icon1-s.png"
        myStyle = {
          "color": "blue",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if(x.filter.name == "Fitness"){
        console.log("fitness")
        icon = "/assets/icon/icon4-s.png"
        myStyle = {
          "color": "grey",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if(x.filter.name == "Famiglie"){
        console.log("fitness")
        icon = "/assets/icon/icon5-s.png"
        myStyle = {
          "color": "white",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if(x.filter.name == "Anziani"){
        console.log("fitness")
        icon = "/assets/icon/icon6-s.png"
        myStyle = {
          "color": "orange",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if(x.filter.name == "Turistico"){
        console.log("fitness")
        icon = "/assets/icon/icon3-s.png"
        myStyle = {
          "color": "purple",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if (x.filter.name == "Foot") {
        console.log("walk")
        icon = "/assets/icon/icon0-s.png"
        myStyle = {
          "color": "green",
          "weight": 5,
          "opacity": 0.65
        };
      }


      this.layerGroup.addLayer(geoJSON({
        "type": "LineString",
        "coordinates": x.coordinates,
      }, { style: myStyle }).bindPopup('<img src="' + icon + '">'));


    })
    console.log(this.layerGroup)
    console.log(this.pathCreated)
  }

  filterTourist(){
    
    this.map.removeLayer(this.layerGroup)

    this.layerGroup = new LayerGroup();
    this.layerGroup.addTo(this.map);

    this.layerGroup.addLayer(marker([this.pointsPath[0].lat, this.pointsPath[0].lng], { icon: this.icons.greenIcon }));
    this.layerGroup.addLayer(marker([this.pointsPath[1].lat, this.pointsPath[1].lng], { icon: this.icons.redIcon }));

    if (this.touristColor === 'light') {
      this.familyDisabled = true
      this.fitnessDisabled = true
      this.oldAgeDisabled = true
      this.carDisabled=true
      this.walkDisabled = true
      this.namedDisabled = true
      this.touristColor = 'secondary'
    } else {
      this.familyDisabled = false
      this.fitnessDisabled = false
      this.oldAgeDisabled = false
      this.carDisabled=false
      this.walkDisabled = false
      this.namedDisabled = false
      this.touristColor = "light"
    }

    if (this.pathFilter.length == 0) {
      this.pathFilter = this.pathCreated
      this.pathCreated = this.pathCreated
        .filter(x => {
          console.log(x.icon)
          return x.icon === "/assets/icon/icon3-s.png" 
        })
    } else {
      this.pathCreated = this.pathFilter
      this.pathFilter = []
    }


    this.pathCreated.map(x => {

      console.log(x)

      let icon
      let myStyle
      if (x.filter.name == "Car" || x.filter.name == "Car by Speed") {
        console.log("car")
        icon = "/assets/icon/icon2-s.png"
        myStyle = {
          "color": "red",
          "weight": 5,
          "opacity": 0.65
        };

      }
      if (x.filter.name== "Bycicle" || x.filter.name == "Bycicle co2") {
        console.log("bicycle")
        icon = "/assets/icon/icon1-s.png"
        myStyle = {
          "color": "blue",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if(x.filter.name == "Fitness"){
        console.log("fitness")
        icon = "/assets/icon/icon4-s.png"
        myStyle = {
          "color": "grey",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if(x.filter.name == "Famiglie"){
        console.log("fitness")
        icon = "/assets/icon/icon5-s.png"
        myStyle = {
          "color": "white",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if(x.filter.name == "Anziani"){
        console.log("fitness")
        icon = "/assets/icon/icon6-s.png"
        myStyle = {
          "color": "orange",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if(x.filter.name == "Turistico"){
        console.log("fitness")
        icon = "/assets/icon/icon3-s.png"
        myStyle = {
          "color": "purple",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if (x.filter.name == "Foot") {
        console.log("walk")
        icon = "/assets/icon/icon0-s.png"
        myStyle = {
          "color": "green",
          "weight": 5,
          "opacity": 0.65
        };
      }


      this.layerGroup.addLayer(geoJSON({
        "type": "LineString",
        "coordinates": x.coordinates,
      }, { style: myStyle }).bindPopup('<img src="' + icon + '">'));


    })
    console.log(this.layerGroup)
    console.log(this.pathCreated)
  }

  filterCar() {

    this.map.removeLayer(this.layerGroup)

    this.layerGroup = new LayerGroup();
    this.layerGroup.addTo(this.map);

    this.layerGroup.addLayer(marker([this.pointsPath[0].lat, this.pointsPath[0].lng], { icon: this.icons.greenIcon }));
    this.layerGroup.addLayer(marker([this.pointsPath[1].lat, this.pointsPath[1].lng], { icon: this.icons.redIcon }));


    if (this.carNamedColor === 'light') {
      this.walkDisabled = true
      this.namedDisabled = true
      this.carNamedColor = 'secondary'
    } else {
      this.walkDisabled = false
      this.namedDisabled = false
      this.carNamedColor = "light"
    }
    console.log(this.pathFilter)
    if (this.pathFilter.length == 0) {
      this.pathFilter = this.pathCreated
      this.pathCreated = this.pathCreated
        .filter(x => {
          console.log(x.icon)
          return x.icon === "/assets/icon/icon2-s.png" 
                || x.icon === "/assets/icon/icon3-s.png" 
                || x.icon === "/assets/icon/icon5-s.png"
                || x.icon === "/assets/icon/icon6-s.png"
        })
    } else {
      this.pathCreated = this.pathFilter
      this.pathFilter = []
    }


    this.pathCreated.map(x => {

      console.log(x)

      let icon
      let myStyle
      if (x.filter.name == "Car" || x.filter.name == "Car by Speed") {
        console.log("car")
        icon = "/assets/icon/icon2-s.png"
        myStyle = {
          "color": "red",
          "weight": 5,
          "opacity": 0.65
        };

      }
      if (x.filter.name== "Bycicle" || x.filter.name == "Bycicle co2") {
        console.log("bicycle")
        icon = "/assets/icon/icon1-s.png"
        myStyle = {
          "color": "blue",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if(x.filter.name == "Fitness"){
        console.log("fitness")
        icon = "/assets/icon/icon4-s.png"
        myStyle = {
          "color": "grey",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if(x.filter.name == "Famiglie"){
        console.log("fitness")
        icon = "/assets/icon/icon5-s.png"
        myStyle = {
          "color": "white",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if(x.filter.name == "Anziani"){
        console.log("fitness")
        icon = "/assets/icon/icon6-s.png"
        myStyle = {
          "color": "orange",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if(x.filter.name == "Turistico"){
        console.log("fitness")
        icon = "/assets/icon/icon3-s.png"
        myStyle = {
          "color": "purple",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if (x.filter.name == "Foot") {
        console.log("walk")
        icon = "/assets/icon/icon0-s.png"
        myStyle = {
          "color": "green",
          "weight": 5,
          "opacity": 0.65
        };
      }


      this.layerGroup.addLayer(geoJSON({
        "type": "LineString",
        "coordinates": x.coordinates,
      }, { style: myStyle }).bindPopup('<img src="' + icon + '">'));


    })
    console.log(this.layerGroup)
    console.log(this.pathCreated)
  }


  filterFoot() {

    this.map.removeLayer(this.layerGroup)

    this.layerGroup = new LayerGroup();
    this.layerGroup.addTo(this.map);


    this.layerGroup.addLayer(marker([this.pointsPath[0].lat, this.pointsPath[0].lng], { icon: this.icons.greenIcon }));
    this.layerGroup.addLayer(marker([this.pointsPath[1].lat, this.pointsPath[1].lng], { icon: this.icons.redIcon }));


    if (this.walkNamedColor === 'light') {
      this.carDisabled = true
      this.namedDisabled = true
      this.walkNamedColor = 'secondary'
    } else {
      this.carDisabled = false
      this.namedDisabled = false
      this.walkNamedColor = "light"
    }
    console.log(this.pathFilter)
    if (this.pathFilter.length == 0) {
      this.pathFilter = this.pathCreated
      this.pathCreated = this.pathCreated
        .filter(x => {
          console.log(x.icon)

          return x.icon === "/assets/icon/icon0-s.png"
                 || x.icon === "/assets/icon/icon4-s.png"
                 || x.icon === "/assets/icon/icon3-s.png" 
                 || x.icon === "/assets/icon/icon5-s.png"
                 || x.icon === "/assets/icon/icon6-s.png"
                 || x.icon === "/assets/icon/icon4-s.png"
        })
    } else {
      this.pathCreated = this.pathFilter

      this.pathFilter = []
    }

    this.pathCreated.map(x => {

      let icon
      let myStyle
      
      if (x.filter.name == "Car" || x.filter.name == "Car by Speed") {
        console.log("car")
        icon = "/assets/icon/icon2-s.png"
        myStyle = {
          "color": "red",
          "weight": 5,
          "opacity": 0.65
        };

      }
      if (x.filter.name== "Bycicle" || x.filter.name == "Bycicle co2") {
        console.log("bicycle")
        icon = "/assets/icon/icon1-s.png"
        myStyle = {
          "color": "blue",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if(x.filter.name == "Fitness"){
        console.log("fitness")
        icon = "/assets/icon/icon4-s.png"
        myStyle = {
          "color": "grey",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if(x.filter.name == "Famiglie"){
        console.log("fitness")
        icon = "/assets/icon/icon5-s.png"
        myStyle = {
          "color": "white",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if(x.filter.name == "Anziani"){
        console.log("fitness")
        icon = "/assets/icon/icon6-s.png"
        myStyle = {
          "color": "orange",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if(x.filter.name == "Turistico"){
        console.log("fitness")
        icon = "/assets/icon/icon3-s.png"
        myStyle = {
          "color": "purple",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if (x.filter.name == "Foot") {
        console.log("walk")
        icon = "/assets/icon/icon0-s.png"
        myStyle = {
          "color": "green",
          "weight": 5,
          "opacity": 0.65
        };
      }

      this.layerGroup.addLayer(geoJSON({
        "type": "LineString",
        "coordinates": x.coordinates,
      }, { style: myStyle }).bindPopup('<img src="' + icon + '">'));

    })
    console.log(this.pathCreated)
  }

  filterBicycle() {

    this.map.removeLayer(this.layerGroup)

    this.layerGroup = new LayerGroup();
    this.layerGroup.addTo(this.map);

    this.layerGroup.addLayer(marker([this.pointsPath[0].lat, this.pointsPath[0].lng], { icon: this.icons.greenIcon }));
    this.layerGroup.addLayer(marker([this.pointsPath[1].lat, this.pointsPath[1].lng], { icon: this.icons.redIcon }));

    if (this.namedColor === 'light') {

      this.carDisabled = true
      this.walkDisabled = true
      this.namedColor = 'secondary'
    } else {
      this.carDisabled = false
      this.walkDisabled = false
      this.namedColor = "light"
    }
    console.log(this.pathFilter)
    if (this.pathFilter.length == 0) {
      this.pathFilter = this.pathCreated

      this.pathCreated = this.pathCreated
        .filter(x => {

          return x.icon === "/assets/icon/icon1-s.png"
                 || x.icon === "/assets/icon/icon3-s.png"
                 || x.icon === "/assets/icon/icon5-s.png"
        })
    } else {

      this.pathCreated = this.pathFilter

      this.pathCreated.map(x => {
      })

      this.pathFilter = []
    }


    this.pathCreated.map(x => {
      console.log(x)
      let icon
      let myStyle
      
      if (x.filter.name == "Car" || x.filter.name == "Car by Speed") {
        console.log("car")
        icon = "/assets/icon/icon2-s.png"
        myStyle = {
          "color": "red",
          "weight": 5,
          "opacity": 0.65
        };

      }
      if (x.filter.name== "Bycicle" || x.filter.name == "Bycicle co2") {
        console.log("bicycle")
        icon = "/assets/icon/icon1-s.png"
        myStyle = {
          "color": "blue",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if(x.filter.name == "Fitness"){
        console.log("fitness")
        icon = "/assets/icon/icon4-s.png"
        myStyle = {
          "color": "grey",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if(x.filter.name == "Famiglie"){
        console.log("fitness")
        icon = "/assets/icon/icon5-s.png"
        myStyle = {
          "color": "white",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if(x.filter.name == "Anziani"){
        console.log("fitness")
        icon = "/assets/icon/icon6-s.png"
        myStyle = {
          "color": "orange",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if(x.filter.name == "Turistico"){
        console.log("fitness")
        icon = "/assets/icon/icon3-s.png"
        myStyle = {
          "color": "purple",
          "weight": 5,
          "opacity": 0.65
        };
      }
      if (x.filter.name == "Foot") {
        console.log("walk")
        icon = "/assets/icon/icon0-s.png"
        myStyle = {
          "color": "green",
          "weight": 5,
          "opacity": 0.65
        };
      }

      this.layerGroup.addLayer(geoJSON({
        "type": "LineString",
        "coordinates": x.coordinates,
      }, { style: myStyle }).bindPopup('<img src="' + icon + '">'));

    })
    console.log(this.pathCreated)
  }

  pathSelected($event) {

    this.map.removeLayer(this.layerGroup)

    this.layerGroup = new LayerGroup();
    this.layerGroup.addTo(this.map);

    this.layerGroup.addLayer(marker([this.pointsPath[0].lat, this.pointsPath[0].lng], { icon: this.icons.greenIcon }));
    this.layerGroup.addLayer(marker([this.pointsPath[1].lat, this.pointsPath[1].lng], { icon: this.icons.redIcon }));

    //this.map.clearLayers()

    this.pathCreated.filter(x => x.filter.value == $event.detail.value)
      .map(x => {

        this.fitlerActive = x
        this.onPathSelected = true
        this.layerGroup.addLayer(geoJSON({
          "type": "LineString",
          "coordinates": x.coordinates,
        }).bindPopup('<h1>' + x.filter.name + '</h1>'));
      })
  }

  setAlarm() {
    this.onPathSelected = false;
    this.savePath = false;

    this.setAlarmBool = true;
    this.timeSelected = undefined
  }

  isSetAlertSelected() {
    console.log("isSetAlertSelected")

    this.isSetAlertSelectedItem = !this.isSetAlertSelectedItem
  }

  itemSelected($event) {

    if (!this.pointsPath[1]) {

      this.endPoints
        .filter(x => x._id == $event.detail.value)
        .map(x => {

          this.layerGroup.addLayer(marker([x.lat, x.long], { icon: this.icons.redIcon }));
          this.pointB = marker([x.lat, x.long], { icon: this.icons.redIcon })

          this.pointsPath[1] = { lat: x.lat, lng: x.long }
        })

    }

    if (this.pointsPath[0] && this.pointsPath[1]) this.pathIsCreated = true;

  }

  setTimeAlert() {
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


      if (!this.pointsPath[0]) {

        this.layerGroup.addLayer(marker([resp.coords.latitude, resp.coords.longitude], { icon: this.icons.redIcon }).bindPopup('<h5>Me!</h5>'));

        this.map.setView([resp.coords.latitude, resp.coords.longitude], 10);

        this.pointsPath[0] = { lat: resp.coords.latitude, lng: resp.coords.longitude, title: "Posizione corrente" }
      }

      if (this.pointsPath[0] && this.pointsPath[1]) this.pathIsCreated = true;
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }


}
