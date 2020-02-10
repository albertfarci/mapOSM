import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Map, tileLayer, marker, icon, polyline, geoJSON, LayerGroup } from 'leaflet';
import L from 'leaflet'
import "leaflet-easybutton"
import { GeoLocationService } from 'src/app/shared/services/geoLocation.service';
import { PathService } from '../../shared/services/path.service';
import { NavigationEnd } from '@angular/router';
import "../../../../node_modules/leaflet-search/src/leaflet-search.js"

@Component({
  selector: 'app-map-display',
  templateUrl: './map-display.component.html',
  styleUrls: ['./map-display.component.scss'],
})
export class MapDisplayComponent implements OnInit {

  @Input() pointOfInterest: []
  @Input() pointPath: any
  @Input() pointA: any
  @Input() pointB: any
  @Input() pathFilter: any = null
  @Output() navigate = new EventEmitter<any>();
  @Output() contract = new EventEmitter<any>();
  @Output() detail = new EventEmitter<any>();
  @Output() location = new EventEmitter<any>();
  pointDetail: any

  private map: Map
  paths
  private layerGroup
  pointsPath = []
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
    public pathService: PathService) {
  }

  ngOnInit() {
    if (this.map) {
      this.map.removeLayer(this.layerGroup);
      this.map.remove()
    }
    this.initMap()
  }

  ngOnChanges() {
    this.pointDetail = {}
    //this.addPointB()
    if (this.pointA) {

      console.log(this.pointA)
      this.addPointA()
    } else if (this.pointB) {
      console.log(this.pointB)

      this.addPointB()
    }
    if (this.pathFilter) {
      console.log(this.pathFilter)
      this.addPaths()
    }
  }

  initMap() {
    this.map = new L.Map('map-page').setView([39.21834898953833, 9.1126227435], 12);

    //L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

    this.layerGroup = new LayerGroup();
    this.layerGroup.addTo(this.map);

    this.addGeolocationButton()

    this.map.on('click', (e) => {
      this.onMapClick(e)
    });

    this.map.invalidateSize();

  }

  addPointB() {
    if (this.layerGroup) {

      this.setPointB({ lat: this.pointB.lat, lng: this.pointB.long, title: this.pointB.label })
      this.pointB = ""
    }
  }

  addPointA() {
    if (this.layerGroup) {
      this.setPointA({ lat: this.pointA.lat, lng: this.pointA.long, title: this.pointA.label })

      this.pointA = ""
    }
  }

  addPaths() {
    console.log("add paths")
    if (this.pathFilter) {
      if (this.pointsPath[0] && this.pointsPath[1]) {

        let pointStart = this.pointsPath[0].lat + "," + this.pointsPath[0].lng
        let pointEnd = this.pointsPath[1].lat + "," + this.pointsPath[1].lng
        this.pathFilter.map(x => {
          console.log(x)
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

                this.pathFilter.push({
                  "filter": x,
                  "type": "LineString",
                  "coordinates": geometryArray2Dim,
                  "icon": x.icon,
                  "duration": posts.duration,
                  "distance": posts.distance,
                  "style": myStyle
                })
                console.log(this.pathFilter)

                this.layerGroup.addLayer(geoJSON({
                  "type": "LineString",
                  "coordinates": geometryArray2Dim,
                }, { style: myStyle }).bindPopup('<img src="' + x.icon + '"><h5>' + x.nome + ' </h5><h5>' + this.timeConverter(posts.duration) + ' </h5><h5>' + this.distanceConverter(posts.distance) + ' </h5>'));

              },
              error => {

              });

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

  setPointB(item: any) {
    if (!this.pointsPath[1]) {

      L.marker([item.lat, item.lng], { title: "Punto B", icon: this.icons.puntoB }).on('click', (x => {

        this.detail.emit()
        this.pointDetail = this.pointsPath[1]
      })).addTo(this.map)


    } else {
      for (const property in this.map._layers) {
        if (this.map._layers[property].options && this.map._layers[property].options.title) {
          if (this.map._layers[property].options.title == "Punto B") {
            if (this.pointPath[1]) {
              this.map._layers[property].setLatLng([item.lat, item.lng]).on('click', (x => {

                this.detail.emit()
                this.pointDetail = this.pointsPath[1]
              })).addTo(this.map)
            } else {
              this.map._layers[property].setLatLng([item.lat, item.lng]).addTo(this.map)
            }
          }
        }
      }
    }

    this.pointsPath[1] = item
    this.map.setView([this.pointsPath[1].lat, this.pointsPath[1].lng], 18)

    this.addControls()
  }

  setPointA(item: any) {
    if (!this.pointsPath[0]) {
      L.marker([item.lat, item.lng], { title: "Punto A", icon: this.icons.puntoA }).addTo(this.map)

    } else {
      for (const property in this.map._layers) {
        if (this.map._layers[property].options && this.map._layers[property].options.title) {
          if (this.map._layers[property].options.title == "Punto A") {
            this.map._layers[property].setLatLng([item.lat, item.lng]).addTo(this.map)
          }
        }
      }
    }
    this.pointsPath[0] = item
    this.map.setView([this.pointsPath[0].lat, this.pointsPath[0].lng], 18)

    this.addControls()
  }

  addControls() {

    if (!!(this.pointsPath[0] && this.pointsPath[1])) {
      this.map.fitBounds([
        [this.pointsPath[0].lat, this.pointsPath[0].lng],
        [this.pointsPath[1].lat, this.pointsPath[1].lng]
      ]);
      this.addContractButton()
      //this.addNavigationButton()

    }
  }

  onMapClick(e) {

    if (!this.pointsPath[0]) {

      this.setPointA({ lat: e.latlng.lat, lng: e.latlng.lng, title: e.latlng.lat + " , " + e.latlng.lng })
    } else if (!this.pointsPath[1]) {

      this.setPointB({ lat: e.latlng.lat, lng: e.latlng.lng, title: e.latlng.lat + " , " + e.latlng.lng })
    }

  }

  addGeolocationButton() {

    if (!document.getElementById("locate")) {
      L.easyButton('<div > <ion-icon name="locate" id="locate"></ion-icon> </div>', () => {
        this.getLocationCoordinates()
      }, { "title": "locate" }).addTo(this.map);
    }

    console.log(this.map)
  }

  addContractButton() {

    if (!document.getElementById("contract")) {
      L.easyButton(' <ion-icon name="contract" id="contract" class="star"></ion-icon>', () => {

        this.contract.emit()
      }).addTo(this.map);
    }

  }

  onNavigate() {
    this.navigate.emit(this.pointsPath);
  }

  addNavigationButton() {

    if (!document.getElementById("navigate")) {
      L.easyButton('<div id="navigate"><ion-icon name="navigate"  class="star"></ion-icon></div>', () => {
        this.map.fitBounds([
          [this.pointsPath[0].lat, this.pointsPath[0].lng],
          [this.pointsPath[1].lat, this.pointsPath[1].lng]
        ]);
        console.log(this.map)
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
          this.setPointA({ lat: resp.latitudine, lng: resp.longitudine, title: "Posizione corrente" })

        })
  }


}

