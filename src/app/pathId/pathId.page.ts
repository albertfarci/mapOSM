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

  path = []
  allPoisthis
  //refactor
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
    private poiService: PoiService

  ) {
  }


  ionViewDidEnter() {

    this.allPoisthis = this.poiService.getAllPois()


    this.subscriptions.push(
      this.currentPointService.currentPointA.subscribe(
        (data) => {
          if (data) {
            if (data != this.pointA && this.map) {
              this.pointA = data
              //this.onStartNavigaitonPopup()
              this.getPath()
            } else {

              this.pointA = data
            }

          }

          //if (this.pointA && this.pointB) this.getPath()

          //this.getPath()
        }
      )
    )
    this.subscriptions.push(
      this.currentPointService.currentPointB.subscribe(
        (data) => {
          if (data) {
            this.pointB = data
          }
          //this.getPath()
        }
      )

    )

    this.subscriptions.push(
      this.observerIdRouter = this._Activatedroute.paramMap.subscribe(params => {
        if (params) {
          this.routerState = params.get("id")
        }
      })
    )



    this.subscriptions.push(
      this.geoLocationService.currentPosition.subscribe(
        resp => {
          if (resp) {


            if (this.map) {

              for (const property in this.map._layers) {
                if (this.map._layers[property].options && this.map._layers[property].options.title) {
                  if (this.map._layers[property].options.title == "PC" || this.map._layers[property].options.title == "Shadow") {
                    this.map.removeLayer(this.map._layers[property])

                  }
                }
              }


              L.marker([resp.latitudine, resp.longitudine], { title: "PC", icon: this.icons.pointPC }).addTo(this.map)
              L.marker([resp.latitudine, resp.longitudine], { title: "Shadow", icon: this.icons.shadowPC }).addTo(this.map)

              this.map.setView([resp.latitudine, resp.longitudine], 16);
              if (this.path.length > 0) {
                if (!this.pathService.isPointOnLine(resp, this.path)) {
                  this.onRicalcoloPopup()
                }
              }
            }
          }
        }
      )
    )


    this.initMap()
  }

  ionViewDidLeave() {
    clearInterval(this.tracker)
    this.unsubscribe$.next()
    this.unsubscribe$.complete()
    this.subscriptions.forEach(sub => sub.unsubscribe())
    this.observerIdRouter.unsubscribe()
  }

  initMap() {



    if (this.map == undefined) {

      this.map = new Map('map-pathId').setView([39.21834898953833, 9.1126227435], 12.5);
      //L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

      setTimeout(() => {
        this.map.invalidateSize()
        //this.getLocationCoordinates()
        //this.geoLocationService.getLocationCoordinatesSetup()
        //this.onStartNavigaitonPopup()
        this.getPath()
        //this.geoLocationService.checkGPSPermission()
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
        for (const property in this.map._layers) {
          if (this.map._layers[property].options && this.map._layers[property].options.title) {
            if (this.map._layers[property].options.title == "Punto A") {

              this.map.removeLayer(this.map._layers[property])
            }
          }
        }

        L.marker([this.pointA.latitudine, this.pointA.longitudine], { title: "Punto A", icon: this.icons.puntoA }).addTo(this.map)

        //this.map.setView([this.pointA.latitudine, this.pointA.longitudine], 16)
      }

    }

  }

  displayPointB() {

    if (this.pointB) {

      L.marker([this.pointB.latitudine, this.pointB.longitudine], { title: "Punto B", icon: this.icons.puntoB }).addTo(this.map)

      //this.map.setView([this.pointB.latitudine, this.pointB.longitudine], 16)
    }

  }

  getPath() {
    /*
    
        */
    this.displayPointA()
    this.displayPointB()
    if (this.pointA && this.pointB) {

      if (this.map) {
        for (const property in this.map._layers) {
          if (this.map._layers[property].options) {
            if (this.map._layers[property].options.style) {
              this.map.removeLayer(this.map._layers[property])
            }
          }
        }
      }

      var point = this.pointA.latitudine + "," + this.pointA.longitudine
      //var point = "39.21477,9.11289"
      var pointEnd = this.pointB.latitudine + "," + this.pointB.longitudine
      this.pathService.getPath(point, pointEnd, this.routerState)
        //this.pathService.getPath(point, pointEnd, 27)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(
          posts => {
            let myStyle = {
              color: 'red',
              dashArray: "5 10",
              weight: 7,
              opacity: 0.65,
            };


            this.pathService.calculateGeometry(posts)
              .pipe(takeUntil(this.unsubscribe$))
              .subscribe(
                geometryArray2Dim => {
                  this.path = geometryArray2Dim
                  this.layerGroup.addLayer(geoJSON({
                    "type": "LineString",
                    "coordinates": geometryArray2Dim,
                    //}).bindPopup('<h1>'+this.currentFilter.name+'</h1>'));
                  }, { style: myStyle }).bindPopup('<h1>Car</h1>'));
                }
              )

          });
      this.tracker = setInterval(() => {
        //  this.geoLocationService.checkGPSPermission()
        //this.geoLocationService.getLocationCoordinates()
        this.geoLocationService.getLocationCoordinatesSetup()
        //this.startTracking();
      }, 5000);
    }
  }

  async onRicalcoloPopup() {
    this.geoLocationService.setChechRicalcolo(false)
    const modal = await this.modalController.create({
      component: MapModalRicalcoloPage
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

}   