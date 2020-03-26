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


  //refactor
  pointA: Point
  pointB: Point
  observerIdRouter
  routerState

  constructor(
    public plt: Platform,
    public router: Router,
    public pathService: PathService,
    public geoLocationService: GeoLocationService,
    public dettaglioPreferitoService: DettaglioPreferitoService,
    private currentPointService: CurrentPointService,
    private _Activatedroute: ActivatedRoute,
    public modalController: ModalController

  ) {
  }


  ionViewDidEnter() {

    this.currentPointService.currentPointB.subscribe(
      (data) => {
        if (data) this.pointB = data

        //this.getPath()
      }
    )
    this.observerIdRouter = this._Activatedroute.paramMap.subscribe(params => {
      if (params) {
        this.routerState = params.get("id")
      }
    });

    this.pathService.poisNearToPoint.subscribe(
      (data) => {
        console.log(data)
        if (data) this.start = data
      }
    )
    this.initMap()
  }

  ionViewDidLeave() {

    this.observerIdRouter.unsubscribe()
  }

  initMap() {

    if (!this.map) {

      this.map = new Map('map-pathId').setView([39.21834898953833, 9.1126227435], 12.5);
      //L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

      setTimeout(() => {
        this.map.invalidateSize()
        this.getLocationCoordinates()

        this.tracker = setInterval(() => {

          this.startTracking();
        }, 3000);
      }, 2000);

      this.layerGroup = new LayerGroup();
      this.layerGroup.addTo(this.map);
    }


  }

  displayPointA() {
    if (this.pointA) {

      for (const property in this.map._layers) {
        if (this.map._layers[property].options && this.map._layers[property].options.title) {
          if (this.map._layers[property].options.title == "Punto A") {
            this.map._layers[property].setLatLng([this.pointA.latitudine, this.pointA.longitudine]).addTo(this.map)
          }
        }
      }

      L.marker([this.pointA.latitudine, this.pointA.longitudine], { title: "Punto A", icon: this.icons.puntoA }).addTo(this.map)

      this.map.setView([this.pointA.latitudine, this.pointA.longitudine], 16)


    }

  }

  displayPointB() {

    console.log("display B")
    if (this.pointB) {

      for (const property in this.map._layers) {
        if (this.map._layers[property].options && this.map._layers[property].options.title) {
          if (this.map._layers[property].options.title == "Punto B") {
            this.map._layers[property].setLatLng([this.pointB.latitudine, this.pointB.longitudine]).addTo(this.map)
          }
        }
      }
      L.marker([this.pointB.latitudine, this.pointB.longitudine], { title: "Punto B", icon: this.icons.puntoB }).addTo(this.map)

      this.map.setView([this.pointB.latitudine, this.pointB.longitudine], 16)
    }

  }

  getPath() {
    /*
    
        */
    if (this.pointA && this.pointB) {

      this.map.fitBounds([
        [this.pointB.latitudine, this.pointB.longitudine],
        [this.pointA.latitudine, this.pointA.longitudine]
      ], { padding: [50, 50] })

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
  }

  startTracking() {
    console.log("startTracking()")
    //this.geoLocationService.checkGPSPermission()
    this.geoLocationService.getLocationCoordinates()
      .subscribe(
        resp => {

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

          this.getPoiNearToPoint(resp)
          //this.getPath(resp,{latitudine:"39.21834898953833",longitudine:"9.1126227435" }as Point)
          //this.getPath(resp)
        })


  }


  getPoiNearToPoint(currentPoint: Point) {

    this.pathService.getAllPOIsNearToPoint(currentPoint);

  }

  getLocationCoordinates() {
    this.geoLocationService.getLocationCoordinates()
      .subscribe(
        resp => {

          this.pointA = { latitudine: resp.latitudine, longitudine: resp.longitudine, title: "Posizione corrente", abstract: "", img: "" }

          this.getPath()
          this.displayPointA()
          this.displayPointB()
        }
      )
  }


  async onAzioniRapide() {
    const modal = await this.modalController.create({
      component: MapModalModalitaPage
    });
    return await modal.present();
  }

  /*
  initMap() {
    this.map = new Map('map-pathId').setView([39.21834898953833, 9.1126227435], 12.5);

    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);



    this.layerGroup = new LayerGroup();
    this.layerGroup.addTo(this.map);


    L.easyButton('<div > <ion-icon name="navigate" class="star"></ion-icon> </div>', () => {
      //if (this.pointsPath[0] && this.pointsPath[1]) {
      this.startTracking()
      //}
    }).addTo(this.map);

    L.easyButton(' <ion-icon name="contract" class="star"></ion-icon>', () => {

      if (document.getElementById("map-pathId").style.height == "55%") {
        document.getElementById("map-pathId").style.height = "100%"
      } else {
        document.getElementById("map-pathId").style.height = "55%"

      }
    }).addTo(this.map);

    this.map.invalidateSize();

  }

  // Methos to get device accurate coordinates using device GPS
  getLocationCoordinates() {
    this.geoLocationService.getLocationCoordinates()
      .subscribe(
        resp => {

          if (this.pointsPath[0]) {
            if (this.pointsPath[0].latitudine != resp.latitudine &&
              this.pointsPath[0].longitudine != resp.longitudine) {

              this.map.removeLayer(this.markerA)

              this.markerA = marker([resp.latitudine, resp.longitudine], { icon: this.icons.puntoA })
              this.layerGroup.addLayer(this.markerA);

              this.map.setView([resp.latitudine, resp.longitudine], 16);
              //this.getPath(resp,{latitudine:"39.21834898953833",longitudine:"9.1126227435" }as Point)

              this.getPoiNearToPoint(resp)

              //this.getPoiNearToPoint({latitudine:"39.21477",longitudine:"9.11289" }as Point)

              this.pointsPath[0] = resp
            }
          } else {
            this.map.removeLayer(this.markerA)

            this.markerA = marker([resp.latitudine, resp.longitudine], { icon: this.icons.puntoA })
            this.layerGroup.addLayer(this.markerA);

            this.map.setView([resp.latitudine, resp.longitudine], 16);
            //this.getPath(resp,{latitudine:"39.21834898953833",longitudine:"9.1126227435" }as Point)

            this.getPoiNearToPoint(resp)


            //Athis.getPoiNearToPoint({latitudine:"39.21477",longitudine:"9.11289" }as Point)

            this.pointsPath[0] = resp
          }


        }
      )
  }

  getPoiNearToPoint(currentPoint: Point) {

    this.pathService.getPOIsNearToPoint(currentPoint, 1)
      .subscribe(
        resp => {
          if (resp.list_nodes) {

            this.start = []
            resp.list_nodes.map(x => {

              this.layerGroup.addLayer(marker([x.lat, x.lon], { icon: this.icons.greenIcon }).bindPopup('<h5>' + x.tags.name + '</h5>'));

              this.start.push({
                icon: "/assets/release1/restaurant.svg",
                item: x
              })
            })
          }

        }
      )

    this.pathService.getPOIsNearToPoint(currentPoint, 2)
      .subscribe(
        resp => {
          if (resp.list_nodes) {

            this.start = []
            resp.list_nodes.map(x => {

              this.layerGroup.addLayer(marker([x.lat, x.lon], { icon: this.icons.greenIcon }).bindPopup('<h5>' + x.tags.name + '</h5>'));

              this.start.push({
                icon: "/assets/release1/shop.svg",
                item: x
              })
            })
          }

        }
      )

    this.pathService.getPOIsNearToPoint(currentPoint, 3)
      .subscribe(
        resp => {
          if (resp.list_nodes) {

            this.start = []
            resp.list_nodes.map(x => {

              this.layerGroup.addLayer(marker([x.lat, x.lon], { icon: this.icons.greenIcon }).bindPopup('<h5>' + x.tags.name + '</h5>'));

              this.start.push({
                icon: "/assets/release1/museum.svg",
                item: x
              })
            })
          }

        }
      )

    this.pathService.getPOIsNearToPoint(currentPoint, 4)
      .subscribe(
        resp => {
          if (resp.list_nodes) {

            this.start = []
            resp.list_nodes.map(x => {

              this.layerGroup.addLayer(marker([x.lat, x.lon], { icon: this.icons.greenIcon }).bindPopup('<h5>' + x.tags.name + '</h5>'));

              this.start.push({
                icon: "/assets/release1/monument.svg",
                item: x
              })
            })
          }

        }
      )

  }

  getPath(start?: Point, end?: Point) {
    var point = start.latitudine + "," + start.longitudine
    //var point = "39.21477,9.11289"
    if (end) {
      var pointEnd = end.latitudine + "," + end.longitudine
    } else {
      var pointEnd = this.pointsPath[1].latitudine + "," + this.pointsPath[1].longitudine
    }
    this.pathService.getPath(point, pointEnd, this.currentFilter.valore)
      //this.pathService.getPath(point, pointEnd, 27)
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

  startTracking() {
    this.navigazioneAttiva = false

    this.map.removeLayer(this.layerGroup)

    this.layerGroup = new LayerGroup();
    this.layerGroup.addTo(this.map);

    //this.layerGroup.addLayer(marker([this.pointsPath[0].latitudine, this.pointsPath[0].longitudine], { icon: this.icons.puntoA }));
    this.layerGroup.addLayer(marker([this.pointsPath[1].latitudine, this.pointsPath[1].longitudine], { icon: this.icons.puntoB }));

    this.geoLocationService.checkGPSPermission()
    this.geoLocationService.getLocationCoordinates()
      .subscribe(
        resp => {
          this.markerA = marker([resp.latitudine, resp.longitudine], { icon: this.icons.puntoA })
          this.layerGroup.addLayer(this.markerA);
          this.map.setView([resp.latitudine, resp.longitudine], 16);
          //this.getPath(resp,{latitudine:"39.21834898953833",longitudine:"9.1126227435" }as Point)
          this.getPath(resp)
        })
    this.tracker = setInterval(() => {
      this.getLocationCoordinates()
    }, 1000);


  }*/

}   