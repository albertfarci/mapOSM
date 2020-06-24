import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Map, tileLayer, marker, icon, polyline, geoJSON, LayerGroup } from 'leaflet';
import L from 'leaflet'
import "leaflet-easybutton"
import { GeoLocationService } from 'src/app/shared/services/geoLocation.service';
import { PathService } from '../../shared/services/path.service';
import { NavigationEnd } from '@angular/router';
import "../../../../node_modules/leaflet-search/src/leaflet-search.js"
import { Platform } from '@ionic/angular';
import { CurrentPointService } from 'src/app/shared/services/current-points.service';
import { Point } from 'src/app/shared/models/point.model';
import { FilterListService } from 'src/app/shared/services/filters.service';
import { CurrentStepService } from 'src/app/shared/services/current-step.services';
import { Subject, ReplaySubject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-map-display',
  templateUrl: './map-display.component.html',
  styleUrls: ['./map-display.component.scss'],
})
export class MapDisplayComponent implements OnInit {

  @Input() pointPath: any
  @Input() pathFilter: any = null
  @Output() navigate = new EventEmitter<any>();
  @Output() contract = new EventEmitter<any>();
  @Output() detail = new EventEmitter<any>();
  @Output() location = new EventEmitter<any>();
  private subscriptions: Subscription[] = []
  pointsPath: Array<Point> = []
  pointDetail: any
  pointA: any
  pointB: any
  pathToDisplay = []
  currentStep

  private map: Map
  paths = []
  private layerGroup
  timeSelected: any
  optionsFilter: boolean = false;
  savePath: boolean = false;

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


  unsubscribe$ = new ReplaySubject(1)

  constructor(
    public plt: Platform,
    public geoLocationService: GeoLocationService,
    public pathService: PathService,
    private currentPointsService: CurrentPointService,
    public filterListService: FilterListService,

    private currentStepService: CurrentStepService) {
  }

  ngOnInit() {
    this.currentPointsService.currentPointA.pipe(takeUntil(this.unsubscribe$)).subscribe(
      (data) => {
        if (data) {

          setTimeout(() => { this.map.invalidateSize() }, 1000);
          if (data.latitudine != "" && data.longitudine != "") {

            this.pathService.setToNullSelectedPath()
            this.pointA = data
            this.addPointA()
          } else {
            for (const property in this.map._layers) {
              if (this.map._layers[property].options && this.map._layers[property].options.title) {
                if (this.map._layers[property].options.title == "Punto A") {
                  this.pointsPath[0] = null
                  this.map.removeLayer(this.map._layers[property])

                }
              }
            }
          }
        }

      }
    )
    this.currentPointsService.currentPointB.pipe(takeUntil(this.unsubscribe$)).subscribe(
      (data) => {
        if (data) {
          setTimeout(() => { this.map.invalidateSize() }, 1000);
          if (data.latitudine != "" && data.longitudine != "") {


            this.pathService.setToNullSelectedPath()
            this.pointB = data
            this.addPointB()
          } else {
            for (const property in this.map._layers) {
              if (this.map._layers[property].options && this.map._layers[property].options.title) {
                if (this.map._layers[property].options.title == "Punto B") {
                  this.pointsPath[1] = null
                  this.map.removeLayer(this.map._layers[property])

                }
              }
            }
          }
        }


      }
    )
    this.pathService.selectedPath.pipe(takeUntil(this.unsubscribe$)).subscribe(
      (data) => {
        if (data) {
          this.pathFilter = data
        } else {
          this.pathFilter = []
        }
        this.addPaths()
      }
    )


    this.currentStepService.currentStep.pipe(takeUntil(this.unsubscribe$)).subscribe(
      (data) => {

        setTimeout(() => { this.map.invalidateSize() }, 1000);
        this.currentStep = data


      }
    )
    this.initMap()
  }


  initMap() {

    if (this.map == undefined) {
      this.map = new L.Map('map-page').setView([39.21834898953833, 9.1126227435], 16);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

      setTimeout(() => { this.map.invalidateSize() }, 1000);

      this.layerGroup = new LayerGroup();

      this.layerGroup.addTo(this.map);

      this.addGeolocationButton()
      this.addResetPoints()

      this.map.on('click', (e) => {

        if (this.currentStep == 3) {
          this.onMapClick(e)
        }
      });

    }
    setTimeout(() => { this.map.invalidateSize(), console.log("set timout") }, 3000);

  }

  addPointB() {
    if (this.layerGroup) {
      this.setPointB(this.pointB)
    }
  }

  addPointA() {
    if (this.layerGroup) {
      this.setPointA(this.pointA)

    }
  }

  addPaths() {
    if (this.map) {
      for (const property in this.map._layers) {
        if (this.map._layers[property].options) {
          if (this.map._layers[property].options.style) {
            this.map.removeLayer(this.map._layers[property])
          }
        }
      }
    }


    if (this.pathFilter.length > 0) {
      if (this.pointsPath[0] && this.pointsPath[1]) {

        let pointStart = this.pointsPath[0].latitudine + "," + this.pointsPath[0].longitudine
        let pointEnd = this.pointsPath[1].latitudine + "," + this.pointsPath[1].longitudine

        this.map.setView([this.pointsPath[0].latitudine, this.pointsPath[0].longitudine], 20)

        this.pathFilter.map(x => {
          if (x.filter.spunta) {

            this.pathService.getPath(pointStart, pointEnd, x.filter.valore)
              .pipe(takeUntil(this.unsubscribe$)).subscribe(
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


                  if (x.filter.nome == "Sicuro") var myStyle = {
                    "color": "blue",
                    "weight": 5,
                    "opacity": 0.65
                  };
                  if (x.filter.nome == "Veloce") var myStyle = {
                    "color": "red",
                    "weight": 5,
                    "opacity": 0.65
                  };
                  if (x.filter.nome == "Ecosostenibile") var myStyle = {
                    "color": "green",
                    "weight": 5,
                    "opacity": 0.65
                  };

                  this.pathToDisplay.push({
                    "filter": x.filter,
                    "type": "LineString",
                    "coordinates": geometryArray2Dim,
                    "icon": x.icon,
                    "duration": posts.duration,
                    "distance": posts.distance,
                    "style": myStyle
                  })
                  this.layerGroup.addLayer(geoJSON({
                    "type": "LineString",
                    "coordinates": geometryArray2Dim,
                  }, { style: myStyle }).bindPopup('<img src="' + x.icon + '"><h5>' + x.filter.nome + ' </h5><h5>' + this.timeConverter(posts.duration) + ' </h5><h5>' + this.distanceConverter(posts.distance) + ' </h5>'));

                },
                error => {

                });

          }


        })
      }

    }

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



  setPointB(item: Point) {
    var customPopup = '<div style="width: 100%"><img src="' + item.img + '"><h5>Punto B</h5>' + item.latitudine + ' , ' + item.longitudine + '<h5>Tap sul segnaposto per i dettagli</h5></div>';

    if (!this.pointsPath[1]) {

      L.marker([item.latitudine, item.longitudine], { title: "Punto B", icon: this.icons.puntoB })
        .bindPopup(customPopup)
        .on('click', (x => {
          this.detail.emit()
          this.pointDetail = this.pointsPath[1]
        })).addTo(this.map).openPopup()



    } else {
      for (const property in this.map._layers) {
        if (this.map._layers[property].options && this.map._layers[property].options.title) {
          if (this.map._layers[property].options.title == "Punto B") {

            this.map._layers[property].setLatLng([item.latitudine, item.longitudine]).bindPopup(customPopup).openPopup().addTo(this.map)

          }
        }
      }
    }
    this.pointsPath[1] = item

    this.map.setView([this.pointsPath[1].latitudine, this.pointsPath[1].longitudine], 20)

  }

  setPointA(item: Point) {

    if (!this.pointsPath[0]) {
      L.marker([item.latitudine, item.longitudine], { title: "Punto A", icon: this.icons.puntoA }).addTo(this.map)

    } else {
      for (const property in this.map._layers) {
        if (this.map._layers[property].options && this.map._layers[property].options.title) {
          if (this.map._layers[property].options.title == "Punto A") {
            this.map._layers[property].setLatLng([item.latitudine, item.longitudine]).addTo(this.map)
          }
        }
      }
    }
    this.pointsPath[0] = item
    this.map.setView([this.pointsPath[0].latitudine, this.pointsPath[0].longitudine], 20)


  }

  addControls() {

    if (!!(this.pointsPath[0] && this.pointsPath[1])) {
      this.map.fitBounds([
        [this.pointsPath[0].latitudine, this.pointsPath[0].longitudine],
        [this.pointsPath[1].latitudine, this.pointsPath[1].longitudine]
      ]);

    }
  }

  onMapClick(e) {
    let tpmPoint = { latitudine: e.latlng.lat, longitudine: e.latlng.lng, title: e.latlng.lat + " , " + e.latlng.lng, img: "", abstract: "" }

    if (!this.pointsPath[0]) {
      this.currentPointsService.setPointA(tpmPoint)
      this.currentStepService.setStep(1)
    } else if (!this.pointsPath[1]) {
      this.currentPointsService.setPointB(tpmPoint)

      this.currentStepService.setStep(1)
    }

  }

  addGeolocationButton() {

    if (!document.getElementById("locate")) {
      L.easyButton('<div > <ion-icon name="locate" id="locate"></ion-icon> </div>', () => {

        this.subscriptions.push(
          this.geoLocationService.currentPosition.subscribe(
            (data) => {
              if (data) this.currentPointsService.setPointA(data)


              this.subscriptions.forEach(subscription => subscription.unsubscribe())
            }
          )

        )
        this.geoLocationService.getLocationCoordinatesSetup()
      }, { "title": "locate" }).addTo(this.map);
    }


  }

  addResetPoints() {

    if (!document.getElementById("close")) {
      L.easyButton('<div > <ion-icon name="close" id="close"></ion-icon> </div>', () => {

        if (!!this.pointsPath[1] && !!this.pointsPath[0]) {

          this.currentPointsService.setPointA({ latitudine: "", longitudine: "", title: "Da dove vuoi partire", img: "", abstract: "" })

          this.currentPointsService.setPointB({ latitudine: "", longitudine: "", title: "Dove vuoi arrivare", img: "", abstract: "" })

          this.pathService.setToNullSelectedPath()
          this.currentStepService.setStep(1).then(
            (success) => {

              this.filterListService.setToNullCurrentFilter()
              this.filterListService.setAllFalseSpunta()
            }
          )

        }

      }, { "title": "locate" }).addTo(this.map);
    }


  }

  onNavigate() {
    this.navigate.emit(this.pointsPath);
  }


  getLocationCoordinates() {


    this.geoLocationService.checkGPSPermission()
  }

  ngOnDestroy() {
    this.unsubscribe$.next(true)
    this.unsubscribe$.complete()
  }

}


