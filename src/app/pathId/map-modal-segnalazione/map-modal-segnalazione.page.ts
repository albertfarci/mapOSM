import { Component, Input } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { Point } from 'src/app/shared/models/point.model';
import { CurrentStepService } from 'src/app/shared/services/current-step.services';
import { FilterListService } from 'src/app/shared/services/filters.service';
import { PathService } from 'src/app/shared/services/path.service';
import { CurrentPointService } from 'src/app/shared/services/current-points.service';
import { post } from 'selenium-webdriver/http';
import { GeoLocationService } from 'src/app/shared/services/geoLocation.service';
@Component({
    selector: 'map-modal-segnalazione-page',
    templateUrl: './map-modal-segnalazione.component.html',
    styleUrls: ['./map-modal-segnalazione.component.scss'],
})
export class MapModalSegnalazionePage {

    constructor(private modalCtrl: ModalController,
        public geoLocationService: GeoLocationService) {

    }

    ionViewDidEnter() {



    }


    inviaSegnalazione() {

        this.geoLocationService.setChechRicalcolo(true)
        let date = new Date()
        console.log(date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes())
        this.modalCtrl.dismiss();
    }

    async closeModal(path) {

        this.geoLocationService.setChechRicalcolo(true)
        this.modalCtrl.dismiss();
    }

}