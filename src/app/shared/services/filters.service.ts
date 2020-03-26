import { Injectable } from '@angular/core';
import { Filter } from '../models/filter.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map, distinctUntilChanged } from 'rxjs/operators';
import { resolve } from 'url';
import deepEqual from 'deep-equal';

@Injectable()
export class FilterListService {

    private readonly filterListSource = new BehaviorSubject<Array<Filter>>(null)
    filterList = this.filterListSource.asObservable()


    private readonly sourceCurrentFilter = new BehaviorSubject<any>(null)
    currentFilter = this.sourceCurrentFilter.asObservable()
    private filterArray = [
        {
            valore: null,
            nome: "Auto",
            modalita_figlio: [
                {
                    valore: null,
                    nome: null,
                    modalita_figlio: [{
                        valore: 25,
                        nome: "Veloce",
                        modalita_figlio: null,
                        spunta: true,
                    }, {
                        valore: 26,
                        nome: "Ecosostenibile",
                        modalita_figlio: null,
                        spunta: true
                    }, {
                        valore: 27,
                        nome: "Sicuro",
                        modalita_figlio: null,
                        spunta: true
                    }],
                    spunta: null,
                    color: 'light',
                    icon: '../assets/release1/auto.svg'
                }
            ],
            spunta: false,
            color: 'light',
            icon: 'car'
        },
        {
            valore: null,
            nome: "Bici",
            modalita_figlio: [{
                valore: null,
                nome: "Turista",
                modalita_figlio: [{
                    valore: 16,
                    nome: "Veloce",
                    modalita_figlio: null,
                    spunta: true
                }, {
                    valore: 17,
                    nome: "Ecosostenibile",
                    modalita_figlio: null,
                    spunta: true
                }, {
                    valore: 18,
                    nome: "Sicuro",
                    modalita_figlio: null,
                    spunta: true
                }],
                spunta: false,
                color: 'light',
                icon: '../assets/release1/turistaBianco.svg'
            }, {
                valore: null,
                nome: "Famiglia",
                modalita_figlio: [{
                    valore: 19,
                    nome: "Veloce",
                    modalita_figlio: null,
                    spunta: true
                }, {
                    valore: 20,
                    nome: "Ecosostenibile",
                    modalita_figlio: null,
                    spunta: true
                }, {
                    valore: 21,
                    nome: "Sicuro",
                    modalita_figlio: null,
                    spunta: true
                }],
                spunta: false,
                color: 'light',
                icon: '../assets/release1/famiglia.svg'
            }, {
                valore: null,
                nome: "Fitness",
                modalita_figlio: [{
                    valore: 22,
                    nome: "Veloce",
                    modalita_figlio: null,
                    spunta: true
                }, {
                    valore: 23,
                    nome: "Ecosostenibile",
                    modalita_figlio: null,
                    spunta: true
                }, {
                    valore: 24,
                    nome: "Sicuro",
                    modalita_figlio: null,
                    spunta: true
                }],
                spunta: false,
                color: 'light',
                icon: '../assets/release1/fitnessBianco.svg'
            },],
            spunta: false,
            color: 'light',
            icon: 'bicycle'
        },
        {
            valore: null,
            nome: "Piedi",
            modalita_figlio: [{
                valore: null,
                nome: "Turista",
                modalita_figlio: [{
                    valore: 1,
                    nome: "Veloce",
                    modalita_figlio: null,
                    spunta: true
                }, {
                    valore: 2,
                    nome: "Ecosostenibile",
                    modalita_figlio: null,
                    spunta: true
                }, {
                    valore: 3,
                    nome: "Sicuro",
                    modalita_figlio: null,
                    spunta: true
                }],
                spunta: false,
                color: 'light',
                icon: '../assets/release1/turistaBianco.svg'
            }, {
                valore: null,
                nome: "Disabili",
                modalita_figlio: [{
                    valore: 4,
                    nome: "Veloce",
                    modalita_figlio: null,
                    spunta: true
                }, {
                    valore: 5,
                    nome: "Ecosostenibile",
                    modalita_figlio: null,
                    spunta: true
                }, {
                    valore: 6,
                    nome: "Sicuro",
                    modalita_figlio: null,
                    spunta: true
                }],
                spunta: false,
                color: 'light',
                icon: '../assets/release1/disabilitaBianco.svg'
            }, {
                valore: null,
                nome: "Anziani",
                modalita_figlio: [{
                    valore: 7,
                    nome: "Veloce",
                    modalita_figlio: null,
                    spunta: true
                }, {
                    valore: 8,
                    nome: "Ecosostenibile",
                    modalita_figlio: null,
                    spunta: true
                }, {
                    valore: 9,
                    nome: "Sicuro",
                    modalita_figlio: null,
                    spunta: true
                }],
                spunta: false,
                color: 'light',
                icon: '../assets/release1/anziano.svg'
            }, {
                valore: null,
                nome: "Famiglia",
                modalita_figlio: [{
                    valore: 10,
                    nome: "Veloce",
                    modalita_figlio: null,
                    spunta: true
                }, {
                    valore: 11,
                    nome: "Ecosostenibile",
                    modalita_figlio: null,
                    spunta: true
                }, {
                    valore: 12,
                    nome: "Sicuro",
                    modalita_figlio: null,
                    spunta: true
                }],
                spunta: false,
                color: 'light',
                icon: '../assets/release1/famiglia.svg'
            }, {
                valore: null,
                nome: "Fitness",
                modalita_figlio: [{
                    valore: 13,
                    nome: "Veloce",
                    modalita_figlio: null,
                    spunta: true
                }, {
                    valore: 14,
                    nome: "Ecosostenibile",
                    modalita_figlio: null,
                    spunta: true
                }, {
                    valore: 15,
                    nome: "Sicuro",
                    modalita_figlio: null,
                    spunta: true
                }],
                spunta: false,
                color: 'light',
                icon: '../assets/release1/fitnessBianco.svg'
            }],
            spunta: false,
            color: 'light',
            icon: 'walk'
        }
    ]

    constructor() {
        this.filterListSource.next(this.filterArray)
    }

    setCurrentFilter(filter) {
        this.sourceCurrentFilter.next(filter)
    }

    setToNullCurrentFilter() {
        this.sourceCurrentFilter.next(null)
    }

    setTrueSpunta(nome): Promise<any> {

        return new Promise((resolve, reject) => {
            var tmp = this.filterArray
            this.filterListSource.next(
                tmp
                    .map(x => {
                        if (x.nome == nome)
                            x.spunta = true
                        return x
                    })
            )
            resolve()
        });

    }

    setThirdLevelTrueSpunta(value): Promise<any> {

        return new Promise((resolve, reject) => {
            var tmp = this.filterArray
            this.filterListSource.next(
                tmp
                    .map(x => {
                        x.modalita_figlio.map(x => {
                            x.modalita_figlio.map(x => {
                                if (x.valore == value) {
                                    x.spunta = true
                                }
                                return x
                            })
                            return x
                        })
                        return x
                    })
            )
            resolve()
        });

    }

    setThirdLevelFalseSpunta(value): Promise<any> {
        return new Promise((resolve, reject) => {
            var tmp = this.filterArray
            this.filterListSource.next(
                tmp
                    .map(x => {
                        x.modalita_figlio.map(x => {
                            x.modalita_figlio.map(modalita => {

                                if (modalita.valore == value) {
                                    modalita.spunta = false
                                }
                                return modalita
                            })
                            return x
                        })
                        return x
                    })
            )
            resolve()
        });
    }

    setSecondLevelTrueSpunta(nome): Promise<any> {

        return new Promise((resolve, reject) => {
            var tmp = this.filterArray
            tmp.map(x => {
                if (x.spunta) {
                    x.modalita_figlio.map(x => {
                        if (x.nome == nome) {
                            x.spunta = true
                        }
                    })
                }
            })
            this.filterListSource.next(tmp)
            resolve()
        });
    }

    setFalseSpunta(nome): Promise<any> {

        return new Promise((resolve, reject) => {
            var tmp = this.filterArray
            this.filterListSource.next(
                tmp
                    .map(x => {
                        if (x.nome == nome)
                            x.spunta = false
                        return x
                    })
            )
            resolve()
        });
    }

    setAllFalseSpunta(): Promise<any> {
        return new Promise((resolve, reject) => {
            var tmp = this.filterArray
            this.filterListSource.next(
                tmp
                    .map(x => {
                        if (x.spunta) {

                            x.color = 'light'
                            x.spunta = false
                        }
                        return x
                    })
            )



            resolve()
        });
    }

    setSecondLevelFalseSpunta(): Promise<any> {
        return new Promise((resolve, reject) => {
            var tmp = this.filterArray
            tmp.map(x => {
                x.modalita_figlio.map(x => {
                    x.spunta = false
                    x.color = "light"
                })

            })

            this.filterListSource.next(tmp)
            resolve()
        });
    }
}