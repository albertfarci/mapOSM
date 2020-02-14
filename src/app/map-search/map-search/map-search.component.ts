import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PoiService } from 'src/app/shared/services/poi.service';

@Component({
  selector: 'app-map-search',
  templateUrl: './map-search.component.html',
  styleUrls: ['./map-search.component.scss'],
})
export class MapSearchComponent implements OnInit {

  @Output() poi = new EventEmitter<any>();
  @Output() back = new EventEmitter<any>();

  start = []
  searchInput: string

  constructor(
    private poiService: PoiService) { }

  ngOnInit() {
    this.searchInput = ""
    this.start = []
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


  selectPOI(poi) {
    this.searchInput = poi.label
    this.poi.emit(poi);
    //document.getElementById("map-page").style.height = "100%"
    this.start = []
  }
}
