import { Component, Input } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { Point } from 'src/app/shared/models/point.model';
import { CurrentStepService } from 'src/app/shared/services/current-step.services';
import { Router } from '@angular/router';

@Component({
    selector: 'map-modal-navigaiton-page',
    templateUrl: './map-modal-navigation.component.html',
    styleUrls: ['./map-modal-navigation.component.scss'],
})
export class MapModalNavigationPage {
    // Data passed in by componentProps

    @Input() path: any;

    constructor(navParams: NavParams,
        private modalCtrl: ModalController,
        private currentStepService: CurrentStepService,

        public router: Router) {
        // componentProps can also be accessed at construction time using NavParams
    }

    ngOnInit() {

    }

    closeModal() {
        this.modalCtrl.dismiss();
    }

    navigateToTracking() {

        this.router.navigate(['/tabs/pathId', this.path.filter.valore]);
        this.modalCtrl.dismiss();
    }

}