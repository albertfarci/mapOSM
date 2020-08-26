import { Component, Input } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { Point } from 'src/app/shared/models/point.model';
import { CurrentStepService } from 'src/app/shared/services/current-step.services';
import { FilterListService } from 'src/app/shared/services/filters.service';
import { PathService } from 'src/app/shared/services/path.service';
import { CurrentPointService } from 'src/app/shared/services/current-points.service';
import { post } from 'selenium-webdriver/http';
import { GeoLocationService } from 'src/app/shared/services/geoLocation.service';
import { FormBuilder, Validators } from '@angular/forms';

import { FormGroup, FormControl } from '@angular/forms';
import { SegnalazioneService } from 'src/app/shared/services/segnalazione.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'map-modal-segnalazione-page',
    templateUrl: './map-modal-segnalazione.component.html',
    styleUrls: ['./map-modal-segnalazione.component.scss'],
})
export class MapModalSegnalazionePage {

    selazioneForm;
    routerState

    @Input() currentPosition
    @Input() path
    private subscriptions: Subscription[] = []

    constructor(private modalCtrl: ModalController,
        private formBuilder: FormBuilder,
        public geoLocationService: GeoLocationService,
        private segnalazioneService: SegnalazioneService,
        private pathService: PathService) {

        this.selazioneForm = this.formBuilder.group({
            description: ['', Validators.required],
            tipology: ['', Validators.required],
            severity: ['', Validators.required],
            mode: ['', Validators.required]
        });



    }


    inviaSegnalazione() {

        this.geoLocationService.setChechRicalcolo(true)
        let date = new Date()
        this.modalCtrl.dismiss();
    }

    onSubmit(customerData) {
        this.selazioneForm.reset();
        let date = new Date()
        customerData.timestamp = date.getMilliseconds()
        let isPointOnLine = this.pathService.isPointOnLine(this.currentPosition, this.path)
        if (isPointOnLine.status) {
            this.segnalazioneService.sendSegnalazione(customerData, this.currentPosition).subscribe()
        }
        this.closeModal()
    }

    async closeModal() {

        this.subscriptions.forEach(sub => sub.unsubscribe())
        this.geoLocationService.setChechRicalcolo(true)
        this.modalCtrl.dismiss();
    }

}