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
import { FilterDisable, FilterColor } from '../shared/models/filter.model';


@Component({
  selector: 'app-map',
  templateUrl: 'map.page.html',
  styleUrls: ['map.page.scss']
})
export class MapPage {
  point: { lng: any; lat: any; };

  paths
  modalita_figlio
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
      iconUrl: '/assets/pref-2/green-m.png',
      iconSize: [25, 25],
      popupAnchor: [0, -20]
    }),
    redIcon: icon({
      iconUrl: '/assets/pref-2/red-m.png',
      iconSize: [25, 25],
      popupAnchor: [0, -20]
    }),
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

      this.isSetAlertSelectedItem = false

      this.pointsPath = []
      this.timeSelected = null
      console.log(this.map)
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

    this.map = new Map('map-page').setView([39.21834898953833, 9.1126227435], 12);

    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);


    this.layerGroup = new LayerGroup();
    this.layerGroup.addTo(this.map);

    this.map.on('dblclick', (e) => {
      this.onMapClick(e)
    });

    this.map.invalidateSize();

    JSON.parse(this.poiService.getMonuments())
      .default
      .map(x => {
        this.endPoints.push(x)
        this.layerGroup.addLayer(marker([x.lat, x.long], { title: x.label, icon: this.icons.greenIcon }).bindPopup('<h5>' + x.label + '</h5>').on('click', (x => {

          //this.layerGroup.addLayer(marker([x.latlng.lat, x.latlng.lng], {icon: this.icons.redIcon}));

          this.pointsPath[1] = { lat: x.latlng.lat, lng: x.latlng.lng, title: x.target.options.title }

        })))
      })



    this.getLocationCoordinates()
    //this.checkGPSPermission()

  }

  onMapClick(e) {

    if (!this.pointsPath[0]) {

      this.layerGroup.addLayer(marker([e.latlng.lat, e.latlng.lng], { icon: this.icons.puntoA }));

      this.pointsPath[0] = { lat: e.latlng.lat, lng: e.latlng.lng, title: e.latlng.lat + " , " + e.latlng.lng }
    } else if (!this.pointsPath[1]) {

      this.layerGroup.addLayer(marker([e.latlng.lat, e.latlng.lng], { icon: this.icons.puntoB }));

      this.pointsPath[1] = { lat: e.latlng.lat, lng: e.latlng.lng, title: e.latlng.lat + " , " + e.latlng.lng }
    }


  }

  deletePoint(index) {

    this.map.removeLayer(this.layerGroup)

    this.layerGroup = new LayerGroup();
    this.layerGroup.addTo(this.map);


    this.pointsPath[index] = null

    if (this.pointsPath[0]) {
      this.layerGroup.addLayer(marker([this.pointsPath[0].lat, this.pointsPath[0].lng], { icon: this.icons.puntoA }))
    }
    if (this.pointsPath[1]) {
      this.layerGroup.addLayer(marker([this.pointsPath[1].lat, this.pointsPath[1].lng], { icon: this.icons.puntoB }))
    }


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



    this.getLocationCoordinates()
  }

  getShowPath(item) {

    this.savePath = true

    this.map.removeLayer(this.layerGroup)

    this.filterListService.filterList.subscribe(
      (data) => {
        this.paths = data
      }
    )

    this.layerGroup = new LayerGroup();
    this.layerGroup.addTo(this.map);

    this.layerGroup.addLayer(marker([this.pointsPath[0].lat, this.pointsPath[0].lng], { icon: this.icons.puntoA }));
    this.layerGroup.addLayer(marker([this.pointsPath[1].lat, this.pointsPath[1].lng], { icon: this.icons.puntoB }));

    this.map.fitBounds([
      [this.pointsPath[0].lat, this.pointsPath[0].lng],
      [this.pointsPath[1].lat, this.pointsPath[1].lng]
    ]);
    this.pathIsCreated = false

  }

  savePathNavigate(item) {
    console.log(item)

    document.getElementById(item.valore).style.color = "red"
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

                if (!this.isSetAlertSelectedItem) {
                  this.toast.show("Percorso salvato, vai nei tuoi Preferiti per avviare il percorso", '3000', 'center').subscribe(
                    toast => {
                      console.log(toast);
                    })
                } else {
                  this.toast.show("Percorso salvato, riceverai una notifica 10 minuti prima di iniziare il percorso", '3000', 'center').subscribe(
                    toast => {
                      console.log(toast);
                    })
                  const now = new Date()
                  const trigger = new Date(this.timeSelected)
                  if (trigger.getTime() > now.getTime()) {
                    this.localNotifications.schedule({
                      id: 1,
                      text: 'Single ILocalNotification',
                      data: { secret: 'key_data' },
                      trigger: { at: trigger },
                      sound: 'file://sound.mp3',
                    });
                  } else {
                    trigger.setDate(now.getDate() + 1)
                    this.localNotifications.schedule({
                      id: 1,
                      text: 'Single ILocalNotification',
                      data: { secret: 'key_data' },
                      trigger: { at: trigger },
                      sound: 'file://sound.mp3',
                    });
                  }
                }

              })
          })
          .catch((e) => {
            this.toast.show("Something went wrong", '3000', 'center').subscribe(
              toast => {
                console.log(toast);
              })
          })
      })

  }

  showNavigate(filter) {
    this.map.removeLayer(this.layerGroup)

    this.layerGroup = new LayerGroup();
    this.layerGroup.addTo(this.map);

    this.layerGroup.addLayer(marker([this.pointsPath[0].lat, this.pointsPath[0].lng], { icon: this.icons.puntoA }));
    this.layerGroup.addLayer(marker([this.pointsPath[1].lat, this.pointsPath[1].lng], { icon: this.icons.puntoB }));


    if (document.getElementById(filter.valore).style.color != "blue") {

      document.getElementById(filter.valore).style.color = "blue"

      this.pathFilter.filter(x => x.filter == filter)
        .map(x => {
          this.layerGroup.addLayer(geoJSON({
            "type": "LineString",
            "coordinates": x.coordinates,
          }, { style: x.style }).bindPopup('<img src="' + x.icon + '"><h5>' + x.filter.nome + ' </h5><h5>' + this.timeConverter(x.duration) + ' </h5><h5>' + this.distanceConverter(x.distance) + ' </h5>'));

        })
    } else {
      document.getElementById(filter.valore).style.color = "grey"

      this.pathFilter.map(x => {
        this.layerGroup.addLayer(geoJSON({
          "type": "LineString",
          "coordinates": x.coordinates,
        }, { style: x.style }).bindPopup('<img src="' + x.icon + '"><h5>' + x.filter.nome + ' </h5><h5>' + this.timeConverter(x.duration) + ' </h5><h5>' + this.distanceConverter(x.distance) + ' </h5>'));

      })
    }

  }


  filterOptions() {
    if (this.optionsFilter) {
      this.optionsFilter = false
    } else {
      this.optionsFilter = true

      this.getEnabled()
    }
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
    this.isSetAlertSelectedItem = true
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
      this.layerGroup.addLayer(marker([resp.coords.latitude, resp.coords.longitude], { icon: this.icons.redIcon }).bindPopup('<h5>Me!</h5>').on('click', (x => {

        //this.layerGroup.addLayer(marker([x.latlng.lat, x.latlng.lng], {icon: this.icons.redIcon}));
        if (!this.pointsPath[0]) {
          this.pointsPath[0] = { lat: x.latlng.lat, lng: x.latlng.lng, title: "Posizione corrente" }
        }
      })));

      this.map.setView([resp.coords.latitude, resp.coords.longitude], 10);

    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  optionsEnabled(): boolean {
    return this.paths.filter(x => x.spunta).length > 0
  }

  timeConverter(val) {
    var hours = Math.floor(val / 3600)
    if (hours > 0) {
      var minutes = Math.floor(val / 60) - (hours * 60)
      return hours + " ore e " + minutes + " minuti"
    } else {
      var minutes = Math.floor(val / 60)
      return minutes + " minuti"
    }
  }

  distanceConverter(val) {
    var km = Math.floor(val / 1000)
    if (km > 0) {
      var metres = Math.floor(val - km * 1000)
      return km + " km e " + metres + " metri"
    } else {
      return val + " metri"
    }
  }

  filterFirstLevel(value) {
    this.pathFilter = []
    this.paths
      .map(x => {
        if (x.nome == value) {
          console.log(x)
          if (x.spunta) {

            this.filterListService.setFalseSpunta(value).then(
              () => {
                this.setDisableButton()
                this.optionsEnabled()
              }
            )
          } else {
            this.filterListService.setAllFalseSpunta()
              .then(
                () => {
                  this.filterListService.setSecondLevelFalseSpunta()
                    .then(
                      () => {
                        this.filterListService.setTrueSpunta(value).then(
                          () => {
                            this.setEnableButton()
                            this.setDisableButton()
                            if (x.nome == "Auto") {
                              this.getPaths(x)
                            }
                          }
                        )
                      })
                }
              )

          }
        }
      })
  }

  setEnableButtonSecondLevel(value) {

    this.pathFilter = []

    this.filterListService.setSecondLevelFalseSpunta().then(
      () => {
        this.paths
          .map(x => {
            if (x.spunta) {
              x.modalita_figlio.map(x => {
                if (x.nome == value) {
                  this.filterListService.setSecondLevelTrueSpunta(value)
                    .then(
                      () => {
                        this.paths
                          .map(x => {
                            if (x.spunta) {
                              x.modalita_figlio.map(x => {
                                if (x.nome == value) {
                                  x.color = 'secondary'
                                }
                              })
                            }
                          })

                        this.paths
                          .map(x => {
                            x.modalita_figlio.map(x => {
                              if (x.nome != value) {
                                x.color = 'light'
                              }
                            })

                          })
                      }
                    )
                }
              })
            }
          })
      }

    )


  }

  getEnabled() {

    return this.paths.filter(x => x.spunta)
      .map(x => { return x.modalita_figlio })[0]
      .map(x => {
        return x
      })

  }

  setEnableButton() {

    this.paths
      .filter(x => x.spunta)
      .map(x => {
        x.color = "secondary"
      })
  }

  setDisableButton() {
    this.paths
      .filter(x => !x.spunta)
      .map(x => {
        x.color = "light"
      })
  }

  getPaths(value) {

    this.map.removeLayer(this.layerGroup)

    this.layerGroup = new LayerGroup();
    this.layerGroup.addTo(this.map);

    this.layerGroup.addLayer(marker([this.pointsPath[0].lat, this.pointsPath[0].lng], { icon: this.icons.puntoA }));
    this.layerGroup.addLayer(marker([this.pointsPath[1].lat, this.pointsPath[1].lng], { icon: this.icons.puntoB }));

    let pointStart = this.pointsPath[0].lat + "," + this.pointsPath[0].lng
    let pointEnd = this.pointsPath[1].lat + "," + this.pointsPath[1].lng
    value.modalita_figlio.map(x => {
      this.pathService.getPath(pointStart, pointEnd, x.valore)
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

            if (x.nome == "Sicuro") var myStyle = {
              "color": "blue",
              "weight": 5,
              "opacity": 0.65
            };
            if (x.nome == "Veloce") var myStyle = {
              "color": "red",
              "weight": 5,
              "opacity": 0.65
            };
            if (x.nome == "Ecosostenibile") var myStyle = {
              "color": "green",
              "weight": 5,
              "opacity": 0.65
            };

            this.pathFilter.push({
              "filter": x,
              "type": "LineString",
              "coordinates": geometryArray2Dim,
              "icon": value.icon,
              "duration": posts.duration,
              "distance": posts.distance,
              "style": myStyle
            })

            this.layerGroup.addLayer(geoJSON({
              "type": "LineString",
              "coordinates": geometryArray2Dim,
            }, { style: myStyle }).bindPopup('<img src="' + value.icon + '"><h5>' + x.nome + ' </h5><h5>' + this.timeConverter(posts.duration) + ' </h5><h5>' + this.distanceConverter(posts.distance) + ' </h5>'));

          },
          error => {

          });
    })
  }
}
