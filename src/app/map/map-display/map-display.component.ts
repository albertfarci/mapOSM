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

@Component({
  selector: 'app-map-display',
  templateUrl: './map-display.component.html',
  styleUrls: ['./map-display.component.scss'],
})
export class MapDisplayComponent implements OnInit {

  @Input() pointOfInterest: []
  @Input() pointPath: any
  @Input() pathFilter: any = null
  @Output() navigate = new EventEmitter<any>();
  @Output() contract = new EventEmitter<any>();
  @Output() detail = new EventEmitter<any>();
  @Output() location = new EventEmitter<any>();
  pointsPath: Array<Point> = []
  pointDetail: any
  pointA: any
  pointB: any
  pathToDisplay = []

  private map: Map
  paths = []
  private layerGroup
  timeSelected: any
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
    public geoLocationService: GeoLocationService,
    public pathService: PathService,
    private currentPointsService: CurrentPointService,
    public filterListService: FilterListService) {
  }

  ngOnInit() {

    if (this.map) {
      this.map.removeLayer(this.layerGroup);
      this.map.remove()
    }
    this.currentPointsService.currentPointA.subscribe(
      (data) => {
        if (data) {
          this.pathService.setToNullSelectedPath()
          this.pointA = data
          this.addPointA()
        }

        this.addControls()
      }
    )
    this.currentPointsService.currentPointB.subscribe(
      (data) => {
        if (data) {
          this.pathService.setToNullSelectedPath()
          this.pointB = data
          this.addPointB()
        }

        this.addControls()

      }
    )
    this.pathService.selectedPath.subscribe(
      (data) => {
        if (data) {
          this.pathFilter = data
        } else {
          this.pathFilter = []
        }
        this.addPaths()
      }
    )
    /*
      this.filterListService.currentFilter.subscribe(
        (data) => {
          if (data) {
            this.pathFilter = data.modalita_figlio
          } else {
            this.pathFilter = []
          }
          this.addPaths()
        }
      )
      */
    this.initMap()
  }


  initMap() {

    this.map = new L.Map('map-page').setView([39.21834898953833, 9.1126227435], 16);

    //L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

    setTimeout(() => { this.map.invalidateSize(true) }, 1000);

    this.layerGroup = new LayerGroup();
    this.layerGroup.addTo(this.map);

    this.addGeolocationButton()

    this.map.on('click', (e) => {
      this.onMapClick(e)
    });




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
    if (this.pathFilter.length == 0) {
      this.pathToDisplay = []
      if (this.map) {
        for (const property in this.map._layers) {
          if (this.map._layers[property].options) {
            if (this.map._layers[property].options.style) {
              this.map.removeLayer(this.map._layers[property])
            }
          }
        }
      }

    }
    if (this.pathFilter.length > 0) {
      if (this.pointsPath[0] && this.pointsPath[1]) {

        let pointStart = this.pointsPath[0].latitudine + "," + this.pointsPath[0].longitudine
        let pointEnd = this.pointsPath[1].latitudine + "," + this.pointsPath[1].longitudine



        this.pathFilter.map(x => {
          if (x.spunta) {

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

                  this.pathToDisplay.push({
                    "filter": x,
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
                  }, { style: myStyle }).bindPopup('<img src="' + x.icon + '"><h5>' + x.nome + ' </h5><h5>' + this.timeConverter(posts.duration) + ' </h5><h5>' + this.distanceConverter(posts.distance) + ' </h5>'));

                },
                error => {

                });

          }


        })
      }

    }

    /*
    this.layerGroup.addLayer(geoJSON({
      "type": "LineString",
      "coordinates": geometryArray2Dim,
    }, { style: myStyle }).bindPopup('<img src="' + value.icon + '"><h5>' + x.nome + ' </h5><h5>' + this.timeConverter(posts.duration) + ' </h5><h5>' + this.distanceConverter(posts.distance) + ' </h5>'));
    */
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
    if (!this.pointsPath[1]) {

      L.marker([item.latitudine, item.longitudine], { title: "Punto B", icon: this.icons.puntoB })
        .on('click', (x => {

          this.detail.emit()
          this.pointDetail = this.pointsPath[1]
        })).addTo(this.map)



    } else {
      for (const property in this.map._layers) {
        if (this.map._layers[property].options && this.map._layers[property].options.title) {
          if (this.map._layers[property].options.title == "Punto B") {

            this.map._layers[property].setLatLng([item.latitudine, item.longitudine]).addTo(this.map)

          }
        }
      }
    }
    L.popup()
      .setLatLng([item.latitudine, item.longitudine])
      .setContent('<h3>Tap sul segnaposto per i dettagli</h3>')
      .openOn(this.map);
    this.pointsPath[1] = item
    this.map.setView([this.pointsPath[1].latitudine, this.pointsPath[1].longitudine], 16)

    this.addControls()
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
    this.map.setView([this.pointsPath[0].latitudine, this.pointsPath[0].longitudine], 16)

    this.addControls()
  }

  addControls() {

    if (!!(this.pointsPath[0] && this.pointsPath[1])) {
      this.map.fitBounds([
        [this.pointsPath[0].latitudine, this.pointsPath[0].longitudine],
        [this.pointsPath[1].latitudine, this.pointsPath[1].longitudine]
      ]);
      //this.addContractButton()
      //this.addNavigationButton()

    }
  }

  onMapClick(e) {
    let tpmPoint = { latitudine: e.latlng.lat, longitudine: e.latlng.lng, title: e.latlng.lat + " , " + e.latlng.lng, img: "", abstract: "" }
    if (!this.pointsPath[0]) {
      this.currentPointsService.setPointA(tpmPoint)
      //this.setPointA(tpmPoint)
    } else if (!this.pointsPath[1]) {
      this.currentPointsService.setPointB(tpmPoint)
      //this.setPointB(tpmPoint)
    }

  }

  addGeolocationButton() {

    if (!document.getElementById("locate")) {
      L.easyButton('<div > <ion-icon name="locate" id="locate"></ion-icon> </div>', () => {
        this.getLocationCoordinates()

      }, { "title": "locate" }).addTo(this.map);
    }


  }

  onNavigate() {
    this.navigate.emit(this.pointsPath);
  }

  addNavigationButton() {

    if (!document.getElementById("navigate")) {
      L.easyButton('<div id="navigate"><ion-icon name="navigate"  class="star"></ion-icon></div>', () => {
        this.map.fitBounds([
          [this.pointsPath[0].latitudine, this.pointsPath[0].longitudine],
          [this.pointsPath[1].latitudine, this.pointsPath[1].longitudine]
        ]);
        (this.map)
        this.map.removeLayer(document.getElementById("navigate"));
        this.navigate.emit(this.pointsPath);
      }).addTo(this.map);
    }

  }

  getLocationCoordinates() {


    this.geoLocationService.checkGPSPermission()
    this.geoLocationService.getLocationCoordinates()
      .subscribe(
        resp => {
          this.currentPointsService.setPointA({ latitudine: resp.latitudine, longitudine: resp.longitudine, title: "Posizione corrente", img: "", abstract: "" })
          //this.setPointA({ latitudine: resp.latitudine, longitudine: resp.longitudine, title: "Posizione corrente" })

        })
  }


}


