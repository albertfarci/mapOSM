import { Component, Input } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { Point } from 'src/app/shared/models/point.model';
import { CurrentStepService } from 'src/app/shared/services/current-step.services';
import { FilterListService } from 'src/app/shared/services/filters.service';
import { PathService } from 'src/app/shared/services/path.service';
import { CurrentPointService } from 'src/app/shared/services/current-points.service';
import { post } from 'selenium-webdriver/http';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Toast } from '@ionic-native/toast/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { MapModalNavigationPage } from './map-modal-navigation/map-modal-navigation.page';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'map-modal-storage-page',
    templateUrl: './map-modal-storage.component.html',
    styleUrls: ['./map-modal-storage.component.scss'],
})
export class MapModalStoragePage {
    // Data passed in by componentProps

    @Input() path: any;
    pointPath: Array<Point> = []
    pointA: any
    pointB: any
    timeSelected: any
    isSetAlertSelectedItem: boolean = false

    unsubscribe$ = new Subject()
    constructor(navParams: NavParams,
        private modalCtrl: ModalController,
        private currenteCtrl: ModalController,
        private sqlite: SQLite,
        private toast: Toast,
        private localNotifications: LocalNotifications,
        private currentPointsService: CurrentPointService,
        public pathService: PathService,
        public router: Router) {

        this.currentPointsService.currentPointA
            .pipe(takeUntil(this.unsubscribe$)).subscribe(
                (data) => {
                    if (data) {
                        this.pointPath[0] = data

                    }
                }
            )
        this.currentPointsService.currentPointB
            .pipe(takeUntil(this.unsubscribe$)).subscribe(
                (data) => {
                    if (data) {
                        this.pointPath[1] = data
                    }

                }
            )
        // componentProps can also be accessed at construction time using NavParams
    }


    closeModal() {
        console.log("close")
        this.currenteCtrl.dismiss();
    }

    setTimeAlert() {
        this.isSetAlertSelectedItem = true
    }


    savePathNavigate() {
        /*
        this.sqlite.create({
            name: 'filters.db',
            location: 'default'
        })
            .then((db: SQLiteObject) => {
                db.executeSql(`CREATE TABLE IF NOT EXISTS paths(
      rowid INTEGER PRIMARY KEY, 
      filter TEXT,
      coordinates TEX)`, [])
                    .then((tableInserted) => {
                        db.executeSql(`
        INSERT INTO paths (filter,coordinates)
          VALUES(?,?)`, [JSON.stringify(this.path), JSON.stringify(this.pointPath)])
                            .then((tableInserted) => {

                                if (!this.isSetAlertSelectedItem) {
                                    this.toast.show("Percorso salvato, vai nei tuoi Preferiti per avviare il percorso", '3000', 'center').subscribe(
                                        toast => {
                                            console.log(toast);
                                        })
                                } else {
                                    this.toast.show("Percorso salvato, riceverai una notifica 10 minuti prima di iniziare il percorso", '3000', 'center').subscribe(
                                        toast => {
                                            console.log(toast);
                                        })
                                    const now = new Date()
                                    const trigger = new Date(this.timeSelected)
                                    if (trigger.getTime() > now.getTime()) {
                                        this.localNotifications.schedule({
                                            id: 1,
                                            text: 'Single ILocalNotification',
                                            data: { secret: 'key_data' },
                                            trigger: { at: trigger },
                                            sound: 'file://sound.mp3',
                                        });
                                    } else {
                                        trigger.setDate(now.getDate() + 1)
                                        this.localNotifications.schedule({
                                            id: 1,
                                            text: 'Single ILocalNotification',
                                            data: { secret: 'key_data' },
                                            trigger: { at: trigger },
                                            sound: 'file://sound.mp3',
                                        });
                                    }
                                }
                                this.pathService.addSavedPath(this.path)
                                //this.closeModal()
                                this.openStorageModal()
                            })
                            
                    })
                    .catch((e) => {
                        this.toast.show("Something went wrong", '3000', 'center').subscribe(
                            toast => {
                                console.log(toast);
                            })
                    })
            })*/

        this.openStorageModal()
    }


    async openStorageModal() {
        console.log(this.path)

        this.closeModal()
        const modal = await this.modalCtrl.create({
            component: MapModalNavigationPage,
            componentProps: {
                'path': this.path,
            },
            cssClass: 'my-custom-modal-css',
            backdropDismiss: true
        });
        return await modal.present();
    }
}