import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { PoiService } from 'src/app/shared/services/poi.service';
import { GeoLocationService } from 'src/app/shared/services/geoLocation.service';
import { IonSearchbar } from '@ionic/angular';
import { CurrentStepService } from 'src/app/shared/services/current-step.services';
import { Router, ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-map-search',
  templateUrl: './map-search.component.html',
  styleUrls: ['./map-search.component.scss'],
})
export class MapSearchComponent implements OnInit {

  @Output() poi = new EventEmitter<any>();
  @Output() back = new EventEmitter<any>();

  @ViewChild('searchbar', { static: false }) searchbar: IonSearchbar;

  isFocused: boolean = false
  start = []
  searchInput: string
  routerState
  observerIdRouter

  constructor(private router: Router,
    private poiService: PoiService,
    public geoLocationService: GeoLocationService,
    private currentStepService: CurrentStepService,
    private _Activatedroute: ActivatedRoute) { }

  ngOnInit() {
    this.searchInput = ""
    this.start = []
    this.isFocused = false

    setTimeout(() => {
      this.searchbar.setFocus()
      this.isFocused = true
    }, 1000);

    this.observerIdRouter = this._Activatedroute.paramMap.subscribe(params => {
      if (params) {
        if (params.get("id") == "A") {
          this.routerState = {
            icon: "/assets/release1/Oval.svg",
            id: params.get("id")
          }
        } else {
          this.routerState = {
            icon: "/assets/release1/OvalBlack.svg",
            id: params.get("id")
          }
        }

      }
    });
  }

  ionViewDidEnter() {

  }

  ionViewDidLeave() {

    this.observerIdRouter.unsubscribe()
  }

  ngOnDestroy() {
    this.observerIdRouter.unsubscribe()
  }

  getLocationCoordinates() {

    this.router.navigateByUrl('/tabs/map')
    this.geoLocationService.getLocationCoordinatesSetup()

  }

  onSearchByKeyword(event: any) {

    this.poiService.getPoisByString(this.searchInput).
      subscribe(
        data => { this.addPoistToList(data.features) }
      )


  }

  addPoistToList = (poisList) => {
    this.start = []
    poisList.map(
      x => {
        this.start.push(x)
      }
    )
  }

  onSearchByKeywordCancel(event) {
    this.start = []
    this.back.emit()
  }


  selectPOI(poi?) {

    this.searchInput = ""
    if (poi) {

      this.poi.emit({ lat: poi.geometry.coordinates[1], long: poi.geometry.coordinates[0], label: poi.properties.name, img: "", abstract: "" })

    } else {
      this.currentStepService.setStep(3)
      this.poi.emit({ lat: "", long: "", label: "", img: "", abstract: "" });
      this.router.navigateByUrl('/tabs/map')
    }
    this.start = []
  }
}
