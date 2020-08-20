import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../shared/services/storage.service';
import { FilterListService } from '../shared/services/filters.service';
import { Subject } from 'rxjs';

import { CurrentPointService } from '../shared/services/current-points.service';
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
  paths: any
  pathsToDisplay: any
  unsubscribe$ = new Subject()
  constructor(
    private router: Router,
    private currentPointService: CurrentPointService,
    private filterService: FilterListService,
    private storageService: StorageService
  ) {

  }



  ionViewDidEnter() {


    this.pathsSaved = []
    this.getPaths();
    /*this.goToPathId({
      modalita_figlio: null,
      nome: "Ecosostenibile",
      spunta: true,
      valore: 26
    })*/
  }

  ionViewDidLeave() {
    this.unsubscribe$.next()
    this.unsubscribe$.complete()
  }

  optionsEnabled(): boolean {
    return this.paths.filter(x => x.spunta).length > 0
  }

  goToPathId(path) {
    //console.log(path.coordinates)

    const pathParsed = JSON.parse(path.coordinates)
    let tpmPoint = { latitudine: pathParsed[0].lat, longitudine: pathParsed[0].lng, title: pathParsed[0].lat + " , " + pathParsed[0].lng, img: "", abstract: "" }
    //let tpmPoint = { latitudine: 39.218675676836675, longitudine: 9.11167695314004, title: "39.218675676836675 , 9.11167695314004", img: "", abstract: "" }
    this.currentPointService.setPointA(tpmPoint)

    tpmPoint = { latitudine: pathParsed[1].lat, longitudine: pathParsed[1].lng, title: pathParsed[1].lat + " , " + pathParsed[1].lng, img: "", abstract: "" }
    //tpmPoint = { latitudine: 39.21795975, longitudine: 9.11490479603865, title: "Torre dell'Elefante", img: "", abstract: "" }
    this.currentPointService.setPointB(tpmPoint)

    this.filterService.setCurrentFilter(JSON.parse(path.filter))
    //this.filterService.setCurrentFilter(path.filter)
    this.router.navigate(['/tabs/pathId']);
  }

  getPaths() {
    this.pathsToDisplay = []
    this.storageService.getPathFromStorage().then(
      (data) => {
        console.log("Data from db:", data)
        this.pathsToDisplay = data
      }
    )

  }

}
