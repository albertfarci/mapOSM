import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Path } from '../models/path.model';
import { Observable, of, BehaviorSubject, ReplaySubject } from 'rxjs';

@Injectable()
export class PathService {

  geometryPath: []

  private readonly selectedPathSource = new BehaviorSubject<Array<any>>(null)
  selectedPath = this.selectedPathSource.asObservable()

  private readonly savedPathSource = new BehaviorSubject<Array<any>>(null)
  savedPath = this.savedPathSource.asObservable()

  tmpSelectedPath: Array<any> = []
  tmpSavedPath: Array<any> = []
  constructor(private http: HttpClient) { }

  getPath(pointStart, pointEnd, filter) {
    return this.http.get<any>(`https://dss03.crs4.it/v1/requestTrip/31-12-2001/` + pointStart + '/' + pointEnd + '/' + filter)
  }

  getPOIsNearToPoint(currentPoint, filter) {
    return this.http.get<any>(`https://dss03.crs4.it/v1/requestTrip/info/?lat=` + currentPoint.latitudine + `&lon=` + currentPoint.longitudine + '&distance=100&type=' + filter)
  }

  calculateGeometry(arrayGeometry): Observable<any> {
    let newGeometry = arrayGeometry.geometry.replace("[", "");
    newGeometry = newGeometry.replace("]", "");
    newGeometry = newGeometry.replace(/ /g, "|");
    newGeometry = newGeometry.replace("|", "");

    // 2. split sulle virgole:
    let geometryArray1Dim = newGeometry.split(",");

    // 3. crea array bidimesionale:
    let geometryArray2Dim = Array.from(Array(geometryArray1Dim.length), () => new Array(2));

    // 4. popola array: per ogni elemento del precedente array, split su |:    
    for (let i = 0; i < geometryArray1Dim.length; i++) {
      let tempArray = geometryArray1Dim[i].split("|");
      for (let j = 0; j < 2; j++) {
        geometryArray2Dim[i][0] = parseFloat(tempArray[0]);
        geometryArray2Dim[i][1] = parseFloat(tempArray[1]);
      }
    }

    return of(geometryArray2Dim)

  }

  addSelectedPath(path) {
    this.tmpSelectedPath.push(path)
    this.selectedPathSource.next(this.tmpSelectedPath)
  }

  addSavedPath(path) {
    this.tmpSavedPath.push(path)
    this.savedPathSource.next(this.tmpSelectedPath)
  }

  removeSelectedPath(path) {
    this.tmpSelectedPath = this.tmpSelectedPath.filter(x => x != path)
    this.selectedPathSource.next(this.tmpSelectedPath)
  }

  setToNullSelectedPath() {
    this.tmpSelectedPath = []
    this.selectedPathSource.next(this.tmpSelectedPath)
  }

  getSelectedPath() {
    return this.tmpSelectedPath
  }

}