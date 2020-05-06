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
    selector: 'map-modal-last-node-page',
    templateUrl: './map-modal-last-node.component.html',
    styleUrls: ['./map-modal-last-node.component.scss'],
})
export class MapModalLastNodePage {
    // Data passed in by componentProps
    constructor(
        private modalCtrl: ModalController) {

    }


    async closeModal() {
        this.modalCtrl.dismiss();
    }

}