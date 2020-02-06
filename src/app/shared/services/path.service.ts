import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Path } from '../models/path.model';
import { Observable, of } from 'rxjs';

@Injectable()
export class PathService {

  geometryPath: []

  constructor(private http: HttpClient) { }

  getPath(pointStart, pointEnd, filter) {
    console.log(filter)
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


}