import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PoiService } from 'src/app/shared/services/poi.service';

@Component({
  selector: 'app-map-points-selection',
  templateUrl: './map-points-selection.component.html',
  styleUrls: ['./map-points-selection.component.scss'],
})
export class MapPointsSelectionComponent implements OnInit {

  @Input() pointsPath: Array<any>
  @Input() pointsA: any
  @Output() poiA = new EventEmitter()
  @Output() poiB = new EventEmitter()

  startA = []
  startB = []
  pointA: any
  pointB: any
  constructor(private poiService: PoiService) { }

  ngOnInit() { }


  ngOnChanges() {
    if (this.pointsPath) {
      if (this.pointsPath.length > 0) {
        this.pointA = this.pointsPath[0]
        this.pointB = this.pointsPath[1]
      }
    }


  }
  onSearchByKeywordCancel(event) {

  }

  onSearchByKeywordPuntoA(event) {
    console.log(this.pointA)
    if (!event.detail) {
      this.startA = []
      document.getElementById("map-page").style.height = "100%"
    } else {
      document.getElementById("map-page").style.height = "0%"
      this.startA = []
      JSON.parse(this.poiService.getMonuments())
        .default
        .map(x => {
          if (x.label.includes(this.pointA)) this.startA.push(x)
        })

      JSON.parse(this.poiService.getArcheoSites())
        .default
        .map(x => {
          if (x.label.includes(this.pointA)) this.startA.push(x)
        })
    }
  }

  onSearchByKeywordPuntoB(event) {
    console.log(this.pointB)
    if (!event.detail) {
      this.startB = []
      document.getElementById("map-page").style.height = "100%"
    } else {
      document.getElementById("map-page").style.height = "0%"
      this.startB = []
      JSON.parse(this.poiService.getMonuments())
        .default
        .map(x => {
          if (x.label.includes(this.pointB)) this.startB.push(x)
        })

      JSON.parse(this.poiService.getArcheoSites())
        .default
        .map(x => {
          if (x.label.includes(this.pointB)) this.startB.push(x)
        })
    }
  }
  selectPuntoA(poi) {
    this.poiA.emit(poi);
    document.getElementById("map-page").style.height = "100%"
    this.startA = []
  }

  selectPuntoB(poi) {
    this.poiB.emit(poi);
    document.getElementById("map-page").style.height = "100%"
    this.startB = []
  }

}
