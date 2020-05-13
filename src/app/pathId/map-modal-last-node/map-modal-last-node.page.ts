import { Component, Input } from '@angular/core';
import { CurrentStepService } from 'src/app/shared/services/current-step.services';
import { FilterListService } from 'src/app/shared/services/filters.service';
import { CurrentPointService } from 'src/app/shared/services/current-points.service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
@Component({
    selector: 'map-modal-last-node-page',
    templateUrl: './map-modal-last-node.component.html',
    styleUrls: ['./map-modal-last-node.component.scss'],
})
export class MapModalLastNodePage {
    // Data passed in by componentProps
    constructor(
        private currentPointService: CurrentPointService,
        private currentStepService: CurrentStepService,
        private filterService: FilterListService,
        private modalCtrl: ModalController,
        public router: Router) {

    }


    async closeModal() {
        this.modalCtrl.dismiss();
    }

    creaNuovoPercorso() {

        this.currentPointService.deletePointA()
        this.currentPointService.deletePointB()
        this.filterService.setAllFalseSpunta()
        this.currentStepService.setStep(1)

        this.router.navigate(['/tabs/map']);
    }
}