import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { PoiService } from 'src/app/shared/services/poi.service';
import { GeoLocationService } from 'src/app/shared/services/geoLocation.service';
import { IonSearchbar } from '@ionic/angular';

@Component({
  selector: 'app-map-search',
  templateUrl: './map-search.component.html',
  styleUrls: ['./map-search.component.scss'],
})
export class MapSearchComponent implements OnInit {

  @Output() poi = new EventEmitter<any>();
  @Output() back = new EventEmitter<any>();

  @ViewChild('searchbar', { static: false }) searchbar: IonSearchbar;

  start = []
  searchInput: string

  constructor(
    private poiService: PoiService,
    public geoLocationService: GeoLocationService) { }

  ngOnInit() {
    this.searchInput = ""
    this.start = []
    setTimeout(() => this.searchbar.setFocus(), 500);
  }

  getLocationCoordinates() {

    this.geoLocationService.checkGPSPermission()
    this.geoLocationService.getLocationCoordinates()
      .subscribe(
        resp => {
          //this.poi.emit({ latitudine: resp.latitudine, longitudine: resp.longitudine, title: "Posizione corrente", img: "", abstract: "" });
          this.selectPOI({ lat: resp.latitudine, long: resp.longitudine, label: "Posizione corrente", img: "", abstract: "" })
          //this.currentPointsService.setPointA({ latitudine: resp.latitudine, longitudine: resp.longitudine, title: "Posizione corrente", img: "", abstract: "" })
          //this.setPointA({ latitudine: resp.latitudine, longitudine: resp.longitudine, title: "Posizione corrente" })

        })
  }

  onSearchByKeyword(event: any) {

    /*
    if (!event.detail) {
      this.start = []
      document.getElementById("map-page").style.height = "100%"
    } else {
      document.getElementById("map-page").style.height = "0%"
      this.start = []
      JSON.parse(this.poiService.getMonuments())
        .default
        .map(x => {
          if (x.label.includes(this.searchInput)) this.start.push(x)
        })

      JSON.parse(this.poiService.getArcheoSites())
        .default
        .map(x => {
          if (x.label.includes(this.searchInput)) this.start.push(x)
        })
    }*/
    this.start = []
    JSON.parse(this.poiService.getMonuments())
      .default
      .map(x => {
        if (x.label.includes(this.searchInput)) this.start.push(x)
      })

    JSON.parse(this.poiService.getArcheoSites())
      .default
      .map(x => {
        if (x.label.includes(this.searchInput)) this.start.push(x)
      })

  }

  onSearchByKeywordCancel(event) {
    this.start = []
    this.back.emit()
  }


  selectPOI(poi?) {

    this.searchInput = ""
    if (poi) {

      this.poi.emit(poi);
    } else {

      this.poi.emit({ lat: "", long: "", label: "", img: "", abstract: "" });
    }
    //document.getElementById("map-page").style.height = "100%"
    this.start = []
  }
}
