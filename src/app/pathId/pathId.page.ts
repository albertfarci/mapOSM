import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Map, LeafIcon, tileLayer, marker, icon, polyline, geoJSON, removeLayers, LayerGroup } from 'leaflet';
import { Platform, ModalController } from '@ionic/angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Toast } from '@ionic-native/toast/ngx';
import { PathService } from '../shared/services/path.service';
import { DettaglioPreferitoService } from '../shared/services/dettaglioPreferito.service';
import { GeoLocationService } from '../shared/services/geoLocation.service';
import L from 'leaflet'
import "leaflet-easybutton"
import { Point } from '../shared/models/point.model';
import { CurrentPointService } from '../shared/services/current-points.service';
import { MapModalModalitaPage } from './map-modal-modalita/map-modal-modalita.page';
import { PoiService } from '../shared/services/poi.service';
import { MapModalStartPage } from './map-modal-start/map-modal-start.page';
import { MapModalRicalcoloPage } from './map-modal-ricalcolo/map-modal-ricalcolo.page';
import { takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { MapModalLastNodePage } from './map-modal-last-node/map-modal-last-node.page';
import { FilterListService } from '../shared/services/filters.service';
import { CurrentStepService } from '../shared/services/current-step.services';
import { MapModalSegnalazionePage } from './map-modal-segnalazione/map-modal-segnalazione.page';

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
    shadowPC: icon({
      iconUrl: '/assets/release1/Ellipse25.svg',
      iconSize: [50, 50],
      popupAnchor: [0, -20]
    }),
    pointPC: icon({
      iconUrl: '/assets/release1/posizioneCorrente.svg',
      iconSize: [50, 50],
      popupAnchor: [0, -20]
    }),
    monument: icon({
      iconUrl: '/assets/release1/pinMonumenti.svg',
      iconSize: [25, 25],
      popupAnchor: [0, -20]
    }),
    museum: icon({
      iconUrl: '/assets/release1/pinMusei.svg',
      iconSize: [25, 25],
      popupAnchor: [0, -20]
    }),
    restaurant: icon({
      iconUrl: '/assets/release1/pinRistoranti.svg',
      iconSize: [25, 25],
      popupAnchor: [0, -20]
    }),
    shop: icon({
      iconUrl: '/assets/release1/pinShopping.svg',
      iconSize: [25, 25],
      popupAnchor: [0, -20]
    }),
    greenIcon: L.icon({
      iconUrl: '/assets/pref-2/green-m.png',
      iconSize: [25, 25],
      popupAnchor: [0, -20]
    })
  }

  tracker
  start = []
  navigazioneAttiva
  poisList = []
  pointsPath: Array<Point> = []
  currentFilter
  layerGroup
  markerA
  map: Map

  lastDateGetted: Date
  path
  allPoisthis
  //refactor
  currentPosition
  pointA: Point
  pointB: Point
  observerIdRouter
  routerState
  toggleRestaurantNearToMe: boolean = false
  toggleMonumentsNearToMe: boolean = false
  toggleMuseumsNearToMe: boolean = false
  toggleShopsNearToMe: boolean = false

  unsubscribe$ = new Subject()

  private subscriptions: Subscription[] = []
  constructor(
    public plt: Platform,
    public router: Router,
    public pathService: PathService,
    public geoLocationService: GeoLocationService,
    public dettaglioPreferitoService: DettaglioPreferitoService,
    private currentPointService: CurrentPointService,
    private _Activatedroute: ActivatedRoute,
    public modalController: ModalController,
    private poiService: PoiService,
    private filterService: FilterListService,

    private currentStepService: CurrentStepService

  ) {
  }


  ionViewDidEnter() {
    this.allPoisthis = this.poiService.getAllPois()
    this.tracker = setInterval(() => {
      console.log("ENter")
      this.map.invalidateSize()
      this.geoLocationService.getLocationCoordinatesSetup()
    }, 5000);
    this.subscriptions.push(
      this.currentPointService.currentPointA.subscribe(
        (data) => {
          if (data) {
            if (data != this.pointA && this.map) {
              this.pointA = data
              this.getPath()
            } else {

              this.pointA = data
            }
          }
        }
      )
    )
    this.subscriptions.push(
      this.currentPointService.currentPointB.subscribe(
        (data) => {
          if (data != this.pointA && this.map) {
            this.pointB = data
            this.getPath()
          } else {

            this.pointB = data
          }
        }
      )

    )

    this.subscriptions.push(
      this.filterService.currentFilter.subscribe(
        (data) => {
          if (data) {
            this.routerState = data.filter.valore
          }
        }
      )

    )


    this.subscriptions.push(
      this.geoLocationService.currentPosition.subscribe(
        resp => {
          if (resp) {

            this.currentPosition = resp

            if (this.map) {
              for (const property in this.map._layers) {
                if (this.map._layers[property].options && this.map._layers[property].options.title) {
                  if (this.map._layers[property].options.title == "PC" || this.map._layers[property].options.title == "Shadow") {
                    this.map.removeLayer(this.map._layers[property])

                  }
                }
              }

              this.lastDateGetted = new Date()
              L.marker([resp.latitudine, resp.longitudine], { title: "PC", icon: this.icons.pointPC }).addTo(this.map)
              L.marker([resp.latitudine, resp.longitudine], { title: "Shadow", icon: this.icons.shadowPC }).addTo(this.map)

              this.map.setView([resp.latitudine, resp.longitudine], 16);
              if (this.path.geometry.length > 0) {
                let isPointOnLine = this.pathService.isPointOnLine(resp, this.path)
                if (!isPointOnLine.status) {
                  if (this.geoLocationService.getCheckRicalcolo()) {

                    this.onRicalcoloPopup()
                  }
                } else {
                  let trackingUser = this.pathService.trackingUser(this.map, resp, this.path)
                  this.sendTrackingUser(isPointOnLine)
                  this.isLastNode(trackingUser.isLast)
                  this.removeNodeFromPath(trackingUser)
                }
              }
            }
          }
        }
      )
    )


    this.initMap()
  }

  sendTrackingUser(tracking) {

    if (tracking.status) {
      let now = new Date();

      const roadSegment = "[" + tracking.nodes[0][0] + ", " + tracking.nodes[0][1] + "]"
      const timestamps = [now.getMilliseconds(), this.lastDateGetted.getMilliseconds()]
      this.geoLocationService.sendTrackingUserData(tracking.nodes[0], timestamps, this.routerState).subscribe()
      this.lastDateGetted = now
    }
  }

  removeNodeFromPath(tracking) {
    console.log(tracking)
    if (tracking.status) {
      for (let i = 0; i < tracking.index; i++) {
        this.path.geometry.shift()
        this.path.nodes.shift()
        this.displayPath(this.path)
      }
    }
  }

  ionViewDidLeave() {
    clearInterval(this.tracker)
    this.unsubscribe$.next()
    this.unsubscribe$.complete()
    this.subscriptions.forEach(sub => sub.unsubscribe())
    this.removePath()
    this.removePointA()
    this.removePointB()
    this.currentPointService.deletePointA()
    this.currentPointService.deletePointB()
    this.filterService.setAllFalseSpunta()
    this.currentStepService.setStep(1)
  }

  removePath() {
    for (const property in this.map._layers) {
      if (this.map._layers[property].options) {
        if (this.map._layers[property].options.style) {
          this.map.removeLayer(this.map._layers[property])
        }
      }
    }

  }

  removePointA() {
    for (const property in this.map._layers) {
      if (this.map._layers[property].options && this.map._layers[property].options.title) {
        if (this.map._layers[property].options.title == "Punto A") {

          this.map.removeLayer(this.map._layers[property])
        }
      }
    }
  }

  removePointB() {
    for (const property in this.map._layers) {
      if (this.map._layers[property].options && this.map._layers[property].options.title) {
        if (this.map._layers[property].options.title == "Punto B") {

          this.map.removeLayer(this.map._layers[property])
        }
      }
    }
  }

  initMap() {



    if (this.map == undefined) {

      this.map = new Map('map-pathId').setView([39.21834898953833, 9.1126227435], 12.5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

      setTimeout(() => {
        this.map.invalidateSize()
        this.getPath()
        this.addButtonOverMap()
      }, 2000);


      this.layerGroup = new LayerGroup();
      this.layerGroup.addTo(this.map);
    }
  }


  addButtonOverMap() {

    this.addMonumentsNearToMeButton();
    this.addMuseumsNearToMeButton();
    this.addRestaurantNearToMeButton();
    this.addShopsNearToMeButton();
    this.addSegnalazioneButton();

  }

  addSegnalazioneButton() {
    if (!document.getElementById("trail-sign")) {
      L.easyButton('<div ><ion-icon src="/assets/release1/alert.svg"></ion-icon></div>', () => {
        this.onSegnalazionePopup()

      }, { "title": "trail-sign" }).addTo(this.map);
    }
  }

  addRestaurantNearToMeButton() {

    if (!document.getElementById("trail-sign")) {
      L.easyButton('<div ><ion-icon src="/assets/release1/ristoranti.svg"></ion-icon></div>', () => {

        this.toggleRestaurantNearToMe = !this.toggleRestaurantNearToMe

        if (this.toggleRestaurantNearToMe) {

          const poisList = [];

          JSON.parse(this.allPoisthis).default.rows
            .filter(
              x => x.poi_subtype == "restaurant"
            )
            .map(
              x => {
                poisList.push(x)
                L.marker([x.lat, x.lon], { title: "restaurant", icon: this.icons.restaurant }).addTo(this.map)
              }
            )

          this.poiService.setCurrentPois(poisList)

        } else {
          for (const property in this.map._layers) {
            if (this.map._layers[property].options && this.map._layers[property].options.title) {
              if (this.map._layers[property].options.title == "restaurant") {

                this.map.removeLayer(this.map._layers[property])
              }
            }
          }
        }

      }, { "title": "trail-sign" }).addTo(this.map);
    }
  }

  addMonumentsNearToMeButton() {

    if (!document.getElementById("trail-sign")) {
      L.easyButton('<div ><ion-icon src="/assets/release1/monumenti.svg"></ion-icon></div>', () => {


      }, { "title": "trail-sign" }).addTo(this.map);
    }
  }

  addMuseumsNearToMeButton() {

    if (!document.getElementById("trail-sign")) {
      L.easyButton('<div ><ion-icon src="/assets/release1/MUSEI.svg"></ion-icon></div>', () => {
        this.toggleMuseumsNearToMe = !this.toggleMuseumsNearToMe

        if (this.toggleMuseumsNearToMe) {

          const poisList = [];

          JSON.parse(this.allPoisthis).default.rows
            .filter(
              x => x.poi_subtype == "museum"
            )
            .map(
              x => {
                poisList.push(x)
                L.marker([x.lat, x.lon], { title: "museum", icon: this.icons.museum }).addTo(this.map)
              }
            )

          this.poiService.setCurrentPois(poisList)

        } else {
          for (const property in this.map._layers) {
            if (this.map._layers[property].options && this.map._layers[property].options.title) {
              if (this.map._layers[property].options.title == "museum") {

                this.map.removeLayer(this.map._layers[property])
              }
            }
          }
        }

      }, { "title": "trail-sign" }).addTo(this.map);
    }
  }

  addShopsNearToMeButton() {

    if (!document.getElementById("trail-sign")) {
      L.easyButton('<div ><ion-icon src="/assets/release1/SHOPPING.svg"></ion-icon></div>', () => {
        this.toggleShopsNearToMe = !this.toggleShopsNearToMe

        if (this.toggleShopsNearToMe) {
          const poisList = [];
          JSON.parse(this.allPoisthis).default.rows
            .filter(
              x => x.poi_type == "shop"
            )
            .map(
              x => {
                poisList.push(x)
                L.marker([x.lat, x.lon], { title: "shop", icon: this.icons.shop }).addTo(this.map)
              }
            )
          this.poiService.setCurrentPois(poisList)

        } else {
          for (const property in this.map._layers) {
            if (this.map._layers[property].options && this.map._layers[property].options.title) {
              if (this.map._layers[property].options.title == "shop") {

                this.map.removeLayer(this.map._layers[property])
              }
            }
          }
        }

      }, { "title": "trail-sign" }).addTo(this.map);
    }
  }


  displayPointA() {
    if (this.pointA) {

      if (this.map) {
        this.removePointA()

        L.marker([this.pointA.latitudine, this.pointA.longitudine], { title: "Punto A", icon: this.icons.puntoA }).addTo(this.map)

      }

    }

  }

  displayPointB() {

    if (this.pointB) {
      if (this.map) {
        this.removePointB()

        L.marker([this.pointB.latitudine, this.pointB.longitudine], { title: "Punto B", icon: this.icons.puntoB }).addTo(this.map)

      }

    }

  }

  getPath() {
    /*
    
        */
    this.displayPointA()
    this.displayPointB()
    if (this.pointA && this.pointB) {


      var point = this.pointA.latitudine + "," + this.pointA.longitudine
      var pointEnd = this.pointB.latitudine + "," + this.pointB.longitudine
      this.pathService.getPath(point, pointEnd, this.routerState)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(
          posts => {



            this.pathService.calculateGeometry(posts)
              .pipe(takeUntil(this.unsubscribe$))
              .subscribe(
                geometryArray2Dim => {
                  this.path = {
                    geometry: geometryArray2Dim,
                    nodes: posts.nodes
                  }
                  this.displayPath(this.path)
                }
              )

          });

    }
  }

  displayPath(path) {
    this.removePath()
    let myStyle = {
      color: 'red',
      dashArray: "5 10",
      weight: 7,
      opacity: 0.65,
    };
    this.layerGroup.addLayer(geoJSON({
      "type": "LineString",
      "coordinates": path.geometry,
    }, { style: myStyle }));
  }

  async onSegnalazionePopup() {
    this.geoLocationService.setChechRicalcolo(false)
    const modal = await this.modalController.create({
      component: MapModalSegnalazionePage,
      componentProps: {
        'currentPosition': this.currentPosition,
        'path': this.path
      }
    });
    return await modal.present();
  }

  async onRicalcoloPopup() {
    this.geoLocationService.setChechRicalcolo(false)
    const modal = await this.modalController.create({
      component: MapModalRicalcoloPage,

    });
    return await modal.present();
  }

  async onStartNavigaitonPopup() {
    const modal = await this.modalController.create({
      component: MapModalStartPage,
      cssClass: 'my-custom-modal-css'
    });
    return await modal.present();
  }

  isLastNode(node) {
    if (node.isLast) {
      console.log(node)
      this.onLastNodePopup()
    }
  }

  async onLastNodePopup() {
    const modal = await this.modalController.create({
      component: MapModalLastNodePage
    });
    return await modal.present();
  }

}   