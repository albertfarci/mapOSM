import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CurrentPointService } from '../shared/services/current-points.service';
import { Point } from '../shared/models/point.model';

@Component({
    selector: 'mapSearch',
    templateUrl: 'map-search.page.html',
    styleUrls: ['map-search.page.scss']
})
export class MapSearchPage {

    observerIdRouter
    routerState
    constructor(private router: Router,
        private _Activatedroute: ActivatedRoute,
        private currentPointService: CurrentPointService) {

    }


    ngOnInit() {
        this.observerIdRouter = this._Activatedroute.paramMap.subscribe(params => {
            if (params) {
                this.routerState = params.get("id")
            }
        });
    }

    ngOnDestroy() {
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


        var tmpState: any = this.routerState
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

}