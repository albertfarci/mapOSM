import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, Platform, ModalController } from '@ionic/angular';
import { FilterListService } from '../shared/services/filters.service';
import { CurrentPointService } from '../shared/services/current-points.service';
import { Point } from '../shared/models/point.model';
import { MapModalPage } from './map-modal/map-modal.page';
import { CurrentStepService } from '../shared/services/current-step.services';
import { MapModalModalitaPage } from './map-modal-modalita/map-modal-modalita.page';



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
    public modalController: ModalController) {

  }

  ionViewDidEnter() {

    this.plt.ready().then(() => {
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

          this.step = data
          if (data != 1) {
            document.getElementById("row-map-display").style.height = "90%"
          }
          if (data == 1) {
            document.getElementById("row-map-display").style.height = "80%"
          }
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

  async onDetail() {
    const modal = await this.modalController.create({
      component: MapModalPage,
      componentProps: {
        'point': this.pointB
      }
    });
    return await modal.present();
  }


  async onAzioniRapide() {
    const modal = await this.modalController.create({
      component: MapModalModalitaPage
    });
    return await modal.present();
  }


}
