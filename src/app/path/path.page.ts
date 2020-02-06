import { Component } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Toast } from '@ionic-native/toast/ngx';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { PreferitiService } from '../shared/services/preferiti.service';
import { DettaglioPreferitoService } from '../shared/services/dettaglioPreferito.service';
import { StorageService } from '../shared/services/storage.service';
import { FilterListService } from '../shared/services/filters.service';

@Component({
  selector: 'app-path',
  templateUrl: 'path.page.html',
  styleUrls: ['path.page.scss']
})
export class PathPage {

  filter;
  pathsSaved = [];
  pathFilter = []

  private optionsFilter: boolean = false;
  private paths: any
  private pathsToDisplay: any

  constructor(
    private router: Router,
    private preferitiService: PreferitiService,
    private dettaglioPreferitoService: DettaglioPreferitoService,
    private storageService: StorageService,
    private filterListService: FilterListService,
    private toast: Toast
  ) {
  }



  ionViewDidEnter() {

    this.pathsSaved = []

    this.filterListService.filterList.subscribe(
      (data) => {
        this.paths = data
      }
    )
    /*
    if (this.preferitiService.preferito.value) {
      switch (this.preferitiService.preferito.value) {
        case 2:
          // code block
          this.filterBicycle()
          break;
        case 4:
          //this.filterCar()
          break;
        case 8:
          //this.filterTourist()
          break;
      }
    }*/
  }
  optionsEnabled(): boolean {
    return this.paths.filter(x => x.spunta).length > 0
  }

  goToPathId(filter) {

    this.dettaglioPreferitoService.setPreferito(this.pathFilter[filter], filter)
    this.router.navigate(['/tabs/pathId']);
  }

  filterBicycle() {
    console.log("bici")
  }


  filterFirstLevel(value) {
    this.pathsToDisplay = []
    this.paths
      .map(x => {
        if (x.nome == value) {

          if (x.spunta) {

            this.filterListService.setFalseSpunta(value).then(
              () => {
                this.setDisableButton()

                this.optionsFilter = false
              }
            )
          } else {
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
                              x.modalita_figlio.map(x => this.getPaths(x))

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


    this.pathsToDisplay = []
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
  }


  getEnabled() {

    return this.paths.filter(x => x.spunta)
      .map(x => { return x.modalita_figlio })[0]
      .map(x => {
        return x
      })

  }

  getPaths(button) {
    this.pathsToDisplay = []
    this.storageService.getPathFromStorage().then(
      (data) => {
        this.pathsToDisplay = data
      }
    )
    /*
    button.modalita_figlio.map(
      x => {
        console.log(x)
        this.pathFilter
          //.filter(path => JSON.parse(path).value == x.valore)
          .map(path => {

            this.toast.show(JSON.parse(path.filter), '3000', 'center').subscribe(
              toast => {
                console.log(toast);
              })
            this.pathsToDisplay.push(path)
          })
      }
    )
*/

  }

}
