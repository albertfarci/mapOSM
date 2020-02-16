import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Toast } from '@ionic-native/toast/ngx';
import { AlertController, Platform, ModalController } from '@ionic/angular';
import L, { geoJSON, icon, LayerGroup, Map, marker } from 'leaflet';
import "leaflet-easybutton";
import { FilterListService } from '../shared/services/filters.service';
import { PathService } from '../shared/services/path.service';
import { PoiService } from '../shared/services/poi.service';
import { CurrentPointService } from '../shared/services/current-points.service';
import { Point } from '../shared/models/point.model';
import { MapModalPage } from './map-modal/map-modal.page';
import { CurrentStepService } from '../shared/services/current-step.services';
import { MapModalModalitaPage } from './map-modal-modalita/map-modal-modalita.page';



@Component({
  selector: 'app-map',
  templateUrl: 'map.page.html',
  styleUrls: ['map.page.scss']
})
export class MapPage {
  point: { lng: any; lat: any; };

  //refactor
  pointsOfInterest = []
  start = []
  step = 1
  pointA: Point = { title: "Da dove vuoi partire", latitudine: "", longitudine: "", abstract: "", img: null }
  pointB: Point = { title: "Dove vuoi arrivare", latitudine: "", longitudine: "", abstract: "", img: null }

  //
  paths
  private layerGroup
  private geoJson = []
  pointsPath = []
  private map: Map
  private onPathSelected = false
  pathFilter = []
  private timetest: any;
  timeSelected: any
  private isSetAlertSelectedItem: boolean;
  optionsFilter: boolean = false;
  savePath: boolean = false;
  icons = {

    greenIcon: L.icon({
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

  constructor(
    public plt: Platform,
    public filterListService: FilterListService,
    public router: Router,
    private poiService: PoiService,
    private sqlite: SQLite,
    private toast: Toast,
    private androidPermissions: AndroidPermissions,
    private geolocation: Geolocation,
    private locationAccuracy: LocationAccuracy,
    private localNotifications: LocalNotifications,
    public alertCtrl: AlertController,
    private currentPointService: CurrentPointService,
    private currentStepService: CurrentStepService,
    public modalController: ModalController) {

    this.timetest = Date.now();
  }

  ionViewDidEnter() {

    this.plt.ready().then(() => {
      this.currentPointService.currentPointA.subscribe(
        (data) => {
          if (data) this.pointA = data
        }
      )
      this.currentPointService.currentPointB.subscribe(
        (data) => {
          if (data) this.pointB = data
        }
      )
      this.currentStepService.currentStep.subscribe(
        (data) => {

          this.step = data
          if (data != 1) {
            document.getElementById("row-map-display").style.height = "90%"
          }
          if (data == 1) {
            document.getElementById("row-map-display").style.height = "80%"
          }
        }
      )
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

      this.filterListService.filterList.subscribe(
        (data) => {
          this.paths = data
        }
      )


      this.isSetAlertSelectedItem = false

      this.pointsPath = []
      this.timeSelected = null
      if (this.map) {
        this.map.removeLayer(this.layerGroup);
        this.map.remove()
        this.savePath = false
        this.onPathSelected = false
        this.isSetAlertSelectedItem = false
      }
      //this.initMap()
    });
  }

  onInputSearch(input) {
    //this.router.navigateByUrl('/tabs/search', { state: input })
    this.router.navigate(['/tabs/search', input]);
  }

  //selezionato punto A
  onPointSelectedA(e) {
    this.pointA = e
  }

  backButton() {
    this.currentStepService.setStep(1).then(
      (success) => {

        console.log("Back")
      }
    )
  }

  //selezionato punto B
  onPointSelectedB(e) {
    this.pointB = e
    this.onDetail()
  }

  //locate pressed
  onNavigate(e) {

    this.pointsPath = e
    /*
    document.getElementById("map-search").style.height = "0%"
    document.getElementById("map-search").style.visibility = "hidden"
    document.getElementById("map-points-selection").style.visibility = "visible"
    document.getElementById("map-points-selection").style.height = "fit-content"
    */

    //this.onContract()
    if (this.step == 1) {
      this.step = 2
    }
  }
  /*
    onDetail() {
      console.log("Detail")
      
      if (document.getElementById("map-page").style.height == "100%") {
  
        document.getElementById("map-page").style.height = "80%"
      } else {
  
        document.getElementById("map-page").style.height = "100%"
      }
      
    }*/

  async onDetail() {
    const modal = await this.modalController.create({
      component: MapModalPage,
      componentProps: {
        'point': this.pointB
      }
    });
    return await modal.present();
  }


  async onAzioniRapide() {
    const modal = await this.modalController.create({
      component: MapModalModalitaPage
    });
    return await modal.present();
  }



  onContract() {
    if (this.step == 1) {
      if (document.getElementById("map-search").style.height == "fit-content" && document.getElementById("map-searchB").style.height == "fit-content") {
        document.getElementById("map-search").style.padding = "0%"
        document.getElementById("map-search").style.height = "0%"
        document.getElementById("map-search").style.visibility = "hidden"

        document.getElementById("map-searchB").style.height = "0%"
        document.getElementById("map-searchB").style.visibility = "hidden"
      } else {
        document.getElementById("map-search").style.padding = "3% 3% 1% 3%"
        document.getElementById("map-search").style.height = "fit-content"
        document.getElementById("map-search").style.visibility = "visible"
        document.getElementById("map-searchB").style.height = "fit-content"
        document.getElementById("map-searchB").style.visibility = "visible"
      }
    }
    if (this.step == 2) {
      if (document.getElementById("map-modalita").style.height == "fit-content") {

        document.getElementById("map-modalita").style.height = "0%"
        document.getElementById("map-modalita").style.visibility = "hidden"
      } else {
        document.getElementById("map-modalita").style.height = "fit-content"
        document.getElementById("map-modalita").style.visibility = "visible"
      }
    }
  }

  initMap() {

    this.map = new L.Map('map-page').setView([39.21834898953833, 9.1126227435], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);


    this.layerGroup = new LayerGroup();
    this.layerGroup.addTo(this.map);

    L.easyButton(' <ion-icon name="contract" class="star"></ion-icon>', () => {

      if (document.getElementById("map-page").style.height == "55%") {
        document.getElementById("map-page").style.height = "100%"
      } else {
        document.getElementById("map-page").style.height = "55%"

      }
    }).addTo(this.map);

    L.easyButton('<div > <ion-icon name="navigate" class="star"></ion-icon> </div>', () => {
      if (this.pointsPath[0] && this.pointsPath[1]) {
        this.getShowPath()
      }
    }).addTo(this.map);


    this.map.on('dblclick', (e) => {
      this.onMapClick(e)
    });

    this.map.invalidateSize();

    JSON.parse(this.poiService.getMonuments())
      .default
      .map(x => {
        this.layerGroup.addLayer(marker([x.lat, x.long], { title: x.label, icon: this.icons.greenIcon }).bindPopup('<h5>' + x.label + '</h5>').on('click', (x => {

          //this.layerGroup.addLayer(marker([x.latlng.lat, x.latlng.lng], {icon: this.icons.redIcon}));

          this.pointsPath[1] = { lat: x.latlng.lat, lng: x.latlng.lng, title: x.target.options.title }

        })))
      })
    var controlSearch = new L.Control.Search({
      position: 'topright',
      initial: false,
      zoom: 12,
      marker: false
    });

    this.map.addControl(controlSearch);


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
        this.layerGroup.addLayer(marker([x.lat, x.long], { title: x.label, icon: this.icons.greenIcon }).bindPopup('<h5>' + x.label + '</h5>').on('click', (x => {

          //this.layerGroup.addLayer(marker([x.latlng.lat, x.latlng.lng], {icon: this.icons.redIcon}));

          this.pointsPath[1] = { lat: x.latlng.lat, lng: x.latlng.lng, title: x.target.options.title }

        })))
      })

    this.getLocationCoordinates()
  }

  getShowPath() {

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


  }

  savePathNavigate(item) {

    document.querySelectorAll("ion-icon[name='heart']")
      .forEach(x => {

        if (item.valore == x.id) x.setAttribute("style", "color: red")
      })
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



  filterOptions() {
    if (this.optionsFilter) {
      this.optionsFilter = false
    } else {
      this.optionsFilter = true

      this.getEnabled()
    }
  }

  isSetAlertSelected() {
    this.isSetAlertSelectedItem = !this.isSetAlertSelectedItem
  }

  setTimeAlert() {
    this.isSetAlertSelectedItem = true
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
      if (this.pointsPath[0] && this.pointsPath[1]) {
        document.getElementById("map-page").style.height = "55%"
        this.map.fitBounds([
          [this.pointsPath[0].lat, this.pointsPath[0].lng],
          [this.pointsPath[1].lat, this.pointsPath[1].lng]
        ]);
      }
      this.map.setView([resp.coords.latitude, resp.coords.longitude], 10);

    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  optionsEnabled(): boolean {
    return this.paths.filter(x => x.spunta).length > 0
  }


  filterFirstLevel(value) {

    this.pathFilter = []
    this.paths
      .map(x => {
        if (x.nome == value) {

          if (x.spunta) {

            this.filterListService.setFalseSpunta(value).then(
              () => {
                this.optionsFilter = false
                this.setDisableButton()
                this.optionsEnabled()
              }
            )
          } else {

            this.optionsFilter = true
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
                              x.modalita_figlio.map(x => this.getPaths(x))

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

    this.pathFilter = value.modalita_figlio

  }
}
