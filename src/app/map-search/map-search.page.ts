import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CurrentPointService } from '../shared/services/current-points.service';
import { Point } from '../shared/models/point.model';
import { PoiService } from '../shared/services/poi.service';
import { GeoLocationService } from '../shared/services/geoLocation.service';
import { CurrentStepService } from '../shared/services/current-step.services';
import { IonSearchbar } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
    selector: 'mapSearch',
    templateUrl: 'map-search.page.html',
    styleUrls: ['map-search.page.scss']
})
export class MapSearchPage implements OnInit {

    observerIdRouter
    routerState

    @ViewChild('searchbar', { static: false }) searchbar: IonSearchbar;

    isFocused: boolean = false
    start = []
    searchInput: string

    private subscriptions: Subscription[] = []

    constructor(private router: Router,
        private _Activatedroute: ActivatedRoute,
        private currentPointService: CurrentPointService,
        private poiService: PoiService,
        public geoLocationService: GeoLocationService,
        private currentStepService: CurrentStepService, ) {

    }


    ngOnInit() {
    }

    ionViewDidEnter() {
        this.searchInput = ""
        this.start = []
        this.isFocused = false

        console.log("ngOnInit")
        setTimeout(() => {
            this.searchbar.setFocus()
            console.log(this.searchbar)
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
        console.log("ngOnInit map page")
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
        console.log("ionViewDidEnter page")
    }

    ionViewDidLeave() {

        console.log("destroys page")
        this.observerIdRouter.unsubscribe()

        this.subscriptions.forEach(subscription => subscription.unsubscribe())
        console.log("ionViewDidEnter page")
    }

    ngOnDestroy() {
        console.log("destroys")
        this.observerIdRouter.unsubscribe()
    }

    onPointSelected(e) {
        var title: string

        if (e.label) {
            title = e.label
        } else {
            title = e.title
        }

        var tmpPoint: Point = {
            latitudine: e.lat,
            longitudine: e.long,
            title: title,
            img: e.image,
            abstract: e.abstract
        }


        var tmpState: any = this.routerState.id
        if (tmpState == "A") {
            this.currentPointService.setPointA(tmpPoint).then(
                (data) => {
                    this.router.navigateByUrl('/tabs/map')
                }
            )
        } else {
            this.currentPointService.setPointB(tmpPoint).then(
                (data) => {
                    this.router.navigateByUrl('/tabs/map')
                }
            )
        }
    }

    onBackTap() {
        this.router.navigateByUrl('/tabs/map')
    }


    getLocationCoordinates() {


        this.subscriptions.push(
            this.geoLocationService.currentPosition.subscribe(
                (data) => {
                    if (data) {
                        this.currentPointService.setPointA(data)
                        this.router.navigateByUrl('/tabs/map')
                    }
                }
            )
        )

        this.geoLocationService.getLocationCoordinatesSetup()



    }

    onSearchByKeyword(event: any) {
        this.poiService.getPoisByString(event.detail.srcElement.value).
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


    selectPOI(poi?) {
        console.log(poi)
        this.searchInput = ""
        if (poi) {
            poi.properties.name = poi.properties.name ? poi.properties.name : poi.properties.street + " " + poi.properties.housenumber
            this.onPointSelected({ lat: poi.geometry.coordinates[1], long: poi.geometry.coordinates[0], label: poi.properties.name, img: "", abstract: "" })

        } else {
            if (this.routerState.id == "A") this.currentPointService.deletePointA()
            this.currentStepService.setStep(3)
            this.onPointSelected({ lat: "", long: "", label: "", img: "", abstract: "" });
            this.router.navigateByUrl('/tabs/map')
        }
        this.start = []
    }

}