import { Component, Input } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { Point } from 'src/app/shared/models/point.model';
import { CurrentStepService } from 'src/app/shared/services/current-step.services';
import { FilterListService } from 'src/app/shared/services/filters.service';
import { PathService } from 'src/app/shared/services/path.service';
import { CurrentPointService } from 'src/app/shared/services/current-points.service';
import { post } from 'selenium-webdriver/http';
import { MapModalStoragePage } from '../map-modal-storage/map-modal-storage.page';

@Component({
    selector: 'map-modal-modalita-page',
    templateUrl: './map-modal-modalita.component.html',
    styleUrls: ['./map-modal-modalita.component.scss'],
})
export class MapModalModalitaPage {
    // Data passed in by componentProps
    pathFilter = []

    pathToDisplay = []
    pointA: any
    pointB: any
    paths
    optionsFilter: boolean = false;

    constructor(navParams: NavParams,
        private modalCtrl: ModalController,
        public filterListService: FilterListService,
        public pathService: PathService,
        private currentPointsService: CurrentPointService) {

        this.currentPointsService.currentPointA.subscribe(
            (data) => {
                if (data) {
                    this.pointA = data
                }
            }
        )
        this.currentPointsService.currentPointB.subscribe(
            (data) => {
                if (data) {
                    this.pointB = data
                }

            }
        )
        this.filterListService.filterList.subscribe(
            (data) => {
                this.paths = data
            }
        )
        this.filterListService.currentFilter.subscribe(
            (data) => {

                if (data) {
                    this.optionsFilter = true
                    this.pathToDisplay = data
                    this.getPaths(data)
                }
            }
        )


        // componentProps can also be accessed at construction time using NavParams
    }


    closeModal() {
        this.modalCtrl.dismiss();
    }


    optionsEnabled(): boolean {
        return this.paths.filter(x => x.spunta).length > 0
    }
    filterFirstLevel(value) {
        this.pathFilter = []
        this.paths
            .map(x => {
                if (x.nome == value) {

                    if (x.spunta) {

                        this.filterListService.setFalseSpunta(value).then(
                            () => {
                                this.optionsFilter = false
                                this.setDisableButton()
                                this.optionsEnabled()
                            }
                        )
                    } else {

                        this.optionsFilter = true
                        this.filterListService.setAllFalseSpunta()
                            .then(
                                () => {
                                    this.filterListService.setSecondLevelFalseSpunta()
                                        .then(
                                            () => {
                                                this.filterListService.setTrueSpunta(value).then(
                                                    () => {
                                                        this.setEnableButton()
                                                        this.setDisableButton()
                                                        if (x.nome == "Auto") {

                                                            this.filterListService.setCurrentFilter(x.modalita_figlio[0])

                                                        }
                                                    }
                                                )
                                            })
                                }
                            )

                    }
                }
            })
    }

    setEnableButtonSecondLevel(value) {

        this.pathFilter = []

        this.filterListService.setSecondLevelFalseSpunta().then(
            () => {
                this.paths
                    .map(x => {
                        if (x.spunta) {
                            x.modalita_figlio.map(x => {
                                if (x.nome == value) {
                                    this.filterListService.setSecondLevelTrueSpunta(value)
                                        .then(
                                            () => {
                                                this.filterListService.setCurrentFilter(x)
                                                this.paths
                                                    .map(x => {
                                                        if (x.spunta) {
                                                            x.modalita_figlio.map(x => {
                                                                if (x.nome == value) {
                                                                    x.color = 'secondary'
                                                                }
                                                            })
                                                        }
                                                    })

                                                this.paths
                                                    .map(x => {
                                                        x.modalita_figlio.map(x => {
                                                            if (x.nome != value) {
                                                                x.color = 'light'
                                                            }

                                                        })

                                                    })
                                            }
                                        )
                                }
                            })
                        }
                    })
            }

        )


    }

    getEnabled() {

        return this.paths.filter(x => x.spunta)
            .map(x => { return x.modalita_figlio })[0]
            .map(x => {
                return x
            })

    }

    setEnableButton() {

        this.paths
            .filter(x => x.spunta)
            .map(x => {
                x.color = "secondary"
            })
    }

    setDisableButton() {
        this.paths
            .filter(x => !x.spunta)
            .map(x => {
                x.color = "light"
            })
        this.filterListService.setToNullCurrentFilter()
        this.pathService.setToNullSelectedPath()
        this.pathToDisplay = []
    }

    getPaths(value) {
        this.pathToDisplay = []
        this.pathFilter = value
        value.modalita_figlio.map(x => {
            let pointStart = this.pointA.latitudine + "," + this.pointA.longitudine
            let pointEnd = this.pointB.latitudine + "," + this.pointB.longitudine
            this.pathService.getPath(pointStart, pointEnd, x.valore)
                .subscribe(
                    posts => {
                        this.pathToDisplay.push({
                            "filter": x,
                            "icon": value.icon,
                            "duration": posts.duration,
                            "distance": posts.distance
                        })

                    },
                    error => {

                    });

        })
    }

    showNavigate(path) {
        if (this.pathService.getSelectedPath().filter(x => x == path).length > 0) {
            document.getElementById(path.valore).style.color = "grey"
            this.pathService.removeSelectedPath(path)
        } else {
            document.getElementById(path.valore).style.color = "blue"
            this.pathService.addSelectedPath(path)
        }

    }

    async openStorageModal(path) {
        const modal = await this.modalCtrl.create({
            component: MapModalStoragePage,
            componentProps: {
                'path': path,
                'pointA': this.pointA,
                'pointB': this.pointB
            }
        });
        return await modal.present();

    }





}