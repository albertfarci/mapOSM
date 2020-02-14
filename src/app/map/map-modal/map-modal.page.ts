import { Component, Input } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { Point } from 'src/app/shared/models/point.model';
import { CurrentStepService } from 'src/app/shared/services/current-step.services';

@Component({
    selector: 'map-modal-page',
    templateUrl: './map-modal.component.html',
    styleUrls: ['./map-modal.component.scss'],
})
export class MapModalPage {
    // Data passed in by componentProps
    @Input() point: Point;

    constructor(navParams: NavParams,
        private modalCtrl: ModalController,
        private currentStepService: CurrentStepService) {
        // componentProps can also be accessed at construction time using NavParams
    }

    closeModal() {
        this.modalCtrl.dismiss();
    }

    onNavigate() {
        this.currentStepService.setStep(2).then(
            (success) => {
                this.closeModal()
            }
        )
    }
}