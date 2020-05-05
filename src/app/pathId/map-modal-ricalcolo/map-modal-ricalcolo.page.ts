import { Component, Input } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { Point } from 'src/app/shared/models/point.model';
import { CurrentStepService } from 'src/app/shared/services/current-step.services';
import { FilterListService } from 'src/app/shared/services/filters.service';
import { PathService } from 'src/app/shared/services/path.service';
import { CurrentPointService } from 'src/app/shared/services/current-points.service';
import { post } from 'selenium-webdriver/http';
import { PoiService } from 'src/app/shared/services/poi.service';
import { GeoLocationService } from 'src/app/shared/services/geoLocation.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
    selector: 'map-modal-ricalcolo-page',
    templateUrl: './map-modal-ricalcolo.component.html',
    styleUrls: ['./map-modal-ricalcolo.component.scss'],
})
export class MapModalRicalcoloPage {
    // Data passed in by componentProps
    start = []
    unsubscribe$ = new Subject()
    constructor(public poiService: PoiService,
        private currentPointService: CurrentPointService,
        public geoLocationService: GeoLocationService,
        private modalCtrl: ModalController) {

    }

    refreshPath() {
        this.geoLocationService.currentPosition
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                resp => {
                    if (resp) {
                        this.geoLocationService.setChechRicalcolo(true)
                        this.currentPointService.setPointA(resp)

                        this.closeModal();
                    }
                }
            )
    }

    async closeModal() {
        this.geoLocationService.setChechRicalcolo(true)
        this.unsubscribe$.next()
        this.unsubscribe$.complete()
        this.modalCtrl.dismiss();
    }

}