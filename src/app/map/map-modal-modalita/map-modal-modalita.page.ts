import { Component, Input } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { Point } from 'src/app/shared/models/point.model';
import { CurrentStepService } from 'src/app/shared/services/current-step.services';
import { FilterListService } from 'src/app/shared/services/filters.service';
import { PathService } from 'src/app/shared/services/path.service';
import { CurrentPointService } from 'src/app/shared/services/current-points.service';
import { post } from 'selenium-webdriver/http';
import { MapModalStoragePage } from '../map-modal-storage/map-modal-storage.page';
import { MapModalNavigationPage } from '../map-modal-storage/map-modal-navigation/map-modal-navigation.page';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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

    unsubscribe$ = new Subject()

    constructor(navParams: NavParams,
        private modalCtrl: ModalController,
        public filterListService: FilterListService,
        public pathService: PathService,
        private currentPointsService: CurrentPointService) {

        this.currentPointsService.currentPointA
            .pipe(takeUntil(this.unsubscribe$)).subscribe(
                (data) => {
                    if (data) {
                        this.pointA = data
                    }
                }
            )
        this.currentPointsService.currentPointB
            .pipe(takeUntil(this.unsubscribe$)).subscribe(
                (data) => {
                    if (data) {
                        this.pointB = data
                    }

                }
            )
        this.filterListService.filterList
            .pipe(takeUntil(this.unsubscribe$)).subscribe(
                (data) => {
                    this.paths = data
                }
            )
        this.filterListService.currentFilter
            .pipe(takeUntil(this.unsubscribe$)).subscribe(
                (data) => {

                    if (data) {
                        this.optionsFilter = true
                        //this.pathToDisplay = data
                        this.getPaths(data)
                    }
                }
            )



        // componentProps can also be accessed at construction time using NavParams
    }

    ionViewDidEnter() {
        this.pathService.selectedPath
            .pipe(takeUntil(this.unsubscribe$)).subscribe(
                (data) => {
                    if (data) {
                        if (data.length) {
                            data.map(data => {
                                document.querySelectorAll("ion-icon[name='eye']")
                                    .forEach(x => {

                                        if (data.filter.valore == x.id) x.setAttribute("style", "color: blue")
                                    })
                            })
                        }
                    }
                }
            )

        this.pathService.savedPath
            .pipe(takeUntil(this.unsubscribe$)).subscribe(
                (data) => {
                    if (data) {
                        data.map(data => {
                            document.querySelectorAll("ion-icon[name='heart']")
                                .forEach(x => {

                                    if (data.filter.valore == x.id) x.setAttribute("style", "color: red")
                                })
                        })
                    }

                }
            )

        if (!!this.getEnabled()) {

            this.optionsFilter = true
        }

    }


    async closeModal(path?) {
        this.modalCtrl.dismiss();

    }

    getSomeClass(name) {
        if (name == "Sicuro") return "blue";
        if (name == "Veloce") return "red";
        if (name == "Ecosostenibile") return "green"
        document.querySelectorAll("ion-row")
            .forEach(x => {
                /*
                    if (x.id == "Sicuro") x.setAttribute("style", "color: blue; weight: 5; opacity: 0.65");
                    if (x.id == "Veloce") x.setAttribute("style", "color: red; weight: 5; opacity: 0.65");
                    if (x.id == "Ecosostenibile") x.setAttribute("style", "color: green; weight: 5; opacity: 0.65");
*/
            })
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
        const arrayFIltere = this.paths.filter(x => x.spunta)
        if (arrayFIltere.length > 0) {

            return this.paths.filter(x => x.spunta)
                .map(x => { return x.modalita_figlio })[0]
                .map(x => {
                    return x
                })
        }

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
                .pipe(takeUntil(this.unsubscribe$))
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
        if (this.pathService.getSelectedPath().filter(x => x.filter == path.filter).length > 0) {
            document.getElementById(path.filter.valore).style.color = "grey"
            this.pathService.removeSelectedPath(path)
        } else {
            document.getElementById(path.filter.valore).style.color = "blue"
            this.pathService.addSelectedPath(path)
        }

    }



    async openStorageModal(path) {
        this.closeModal()
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

    ionViewDidLeave() {
        this.unsubscribe$.next()
        this.unsubscribe$.complete()
    }



}