import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, Platform, ModalController } from '@ionic/angular';
import { FilterListService } from '../shared/services/filters.service';
import { CurrentPointService } from '../shared/services/current-points.service';
import { Point } from '../shared/models/point.model';
import { MapModalPage } from './map-modal/map-modal.page';
import { CurrentStepService } from '../shared/services/current-step.services';
import { MapModalModalitaPage } from './map-modal-modalita/map-modal-modalita.page';
import { PathService } from '../shared/services/path.service';



@Component({
  selector: 'app-map',
  templateUrl: 'map.page.html',
  styleUrls: ['map.page.scss']
})
export class MapPage {
  point: { lng: any; lat: any; };

  //refactor
  step = 1
  pointA: Point = { title: "Da dove vuoi partire", latitudine: "", longitudine: "", abstract: "", img: null }
  pointB: Point = { title: "Dove vuoi arrivare", latitudine: "", longitudine: "", abstract: "", img: null }

  //
  paths
  pointsPath = []
  pathFilter = []
  timeSelected: any
  private isSetAlertSelectedItem: boolean;
  optionsFilter: boolean = false;
  savePath: boolean = false;

  constructor(
    public plt: Platform,
    public filterListService: FilterListService,
    public router: Router,
    public alertCtrl: AlertController,
    private currentPointService: CurrentPointService,
    private currentStepService: CurrentStepService,
    public modalController: ModalController,
    public pathService: PathService) {

    this.filterListService.filterList.subscribe(
      (data) => {
        this.paths = data
      }
    )
  }

  ionViewDidEnter() {

    this.plt.ready().then(() => {


      document.getElementById('interactive');
      document.getElementById('load').style.visibility = "hidden";

      this.currentPointService.currentPointA.subscribe(
        (data) => {
          if (data) this.pointA = data
        }
      )
      this.currentPointService.currentPointB.subscribe(
        (data) => {
          if (data) this.pointB = data
        }
      )
      this.currentStepService.currentStep.subscribe(
        (data) => {
          console.log(data)
          this.step = data
          /*if (data != 1) {
            document.getElementById("row-map-display").style.height = "90%"
          }
          if (data == 1) {
            document.getElementById("row-map-display").style.height = "80%"
          }*/
        }
      )
      /*
   this.sqlite.create({
    name: 'filters.db',
    location: 'default'
  })
    .then((db: SQLiteObject) => {
      db.executeSql(`DROP TABLE paths`,[])
      .then((tableInserted)=>{
        this.toast.show("TABLE DROPPED", '3000', 'center').subscribe(
          toast => {
            console.log(toast);
        })
      })
    })*/

      this.filterListService.filterList.subscribe(
        (data) => {
          this.paths = data
        }
      )


    });
  }

  remove(removeItem) {
    console.log(removeItem)
    if (removeItem == "A") {
      this.currentPointService.deletePointA()
    } else {
      this.currentPointService.deletePointB()
    }

    this.filterListService.setToNullCurrentFilter()
    this.pathService.setToNullSelectedPath()
  }

  onInputSearch(input) {
    //this.router.navigateByUrl('/tabs/search', { state: input })
    this.router.navigate(['/tabs/search', input]);
  }

  //selezionato punto A
  onPointSelectedA(e) {
    this.pointA = e
  }

  backButton() {
    this.currentStepService.setStep(1).then(
      (success) => {

      }
    )
  }

  //selezionato punto B
  onPointSelectedB(e) {
    console.log("selected")
    this.pointB = e
    this.onDetail()
  }

  //locate pressed
  onNavigate(e) {

    this.pointsPath = e
    if (this.step == 1) {
      this.step = 2
    }
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


  getEnabled() {

    return this.paths.filter(x => x.spunta)
      .map(x => { return x.modalita_figlio })[0]
      .map(x => {
        return x
      })

  }


  optionsEnabled(): boolean {
    return this.paths.filter(x => x.spunta).length > 0
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
  }

  async onDetail() {
    /*
    const modal = await this.modalController.create({
      component: MapModalPage,
      componentProps: {
        'point': this.pointB
      }
    });
    return await modal.present();*/
    console.log("select")
    this.currentStepService.setStep(2).then(
      (success) => {
      }
    )
  }


  async onAzioniRapide() {
    const modal = await this.modalController.create({
      component: MapModalModalitaPage
    });
    return await modal.present();
  }


}
