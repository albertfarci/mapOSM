import { Component, Input } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { Point } from 'src/app/shared/models/point.model';
import { CurrentStepService } from 'src/app/shared/services/current-step.services';
import { FilterListService } from 'src/app/shared/services/filters.service';
import { PathService } from 'src/app/shared/services/path.service';
import { CurrentPointService } from 'src/app/shared/services/current-points.service';
import { post } from 'selenium-webdriver/http';
@Component({
    selector: 'map-modal-modalita-page',
    templateUrl: './map-modal-modalita.component.html',
    styleUrls: ['./map-modal-modalita.component.scss'],
})
export class MapModalModalitaPage {
    // Data passed in by componentProps
    start = []

    constructor(public pathService: PathService,
        private modalCtrl: ModalController) {

    }

    ionViewDidEnter() {

        this.pathService.poisNearToPoint.subscribe(
            (data) => {
                console.log(data)
                if (data) this.start = data
            }
        )

    }


    async closeModal(path) {
        this.modalCtrl.dismiss();
    }

}