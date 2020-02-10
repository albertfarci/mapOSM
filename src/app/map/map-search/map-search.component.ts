import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PoiService } from 'src/app/shared/services/poi.service';

@Component({
  selector: 'app-map-search',
  templateUrl: './map-search.component.html',
  styleUrls: ['./map-search.component.scss'],
})
export class MapSearchComponent implements OnInit {

  @Output() poi = new EventEmitter<any>();
  start = []
  searchInput: string

  constructor(
    private poiService: PoiService) { }

  ngOnInit() { }

  onSearchByKeyword(event: any) {

    console.log(this.searchInput)
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
    }

  }

  onSearchByKeywordCancel(event) {
    console.log(event)
  }


  selectPOI(poi) {
    this.poi.emit(poi);
    document.getElementById("map-page").style.height = "100%"
    this.start = []
  }
}
