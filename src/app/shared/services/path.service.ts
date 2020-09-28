import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Path } from '../models/path.model';
import { Observable, of, BehaviorSubject, ReplaySubject } from 'rxjs';

import L from 'leaflet'
import "leaflet-geometryutil"

@Injectable()
export class PathService {

  geometryPath: []

  private readonly selectedPathSource = new BehaviorSubject<Array<any>>(null)
  selectedPath = this.selectedPathSource.asObservable()

  private readonly savedPathSource = new BehaviorSubject<Array<any>>(null)
  savedPath = this.savedPathSource.asObservable()

  private readonly poisNearToPointSource = new BehaviorSubject<Array<any>>(null)
  poisNearToPoint = this.poisNearToPointSource.asObservable()

  tmpSelectedPath: Array<any> = []
  tmpSavedPath: Array<any> = []
  constructor(private http: HttpClient) { }

  getPath(pointStart, pointEnd, filter) {

    return this.http.get<any>(`https://cmc-backend.crs4.it/routings?origin=` + pointStart + '&destination=' + pointEnd + '&mode=' + filter,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 0e4d596a1d6ec5461fb7b48c1efe535702f6c69534a4c7e1ed96b02d08e1937cec211747b5d350bf5ae43a2dcfc11ab8870ee1bc4a3f3afaae37d34fb08548fb6fe3cc80b5c221c3f3d137df55a96318c985b97c6bbd1c225c4566700b4a443fe804536bea946db76eac189a397a281f46b1b6d688658229bbdd2e117879ae0a97e9c9946bb7d27d06e2460e5b82b27b0872e53f4bf00f49936232f2abf731e64f23a7fd87a1b3dc9f95f49bc7ad252098362973c5c38f195ea9e160871de593'
        }
      });



    //return this.http.get<any>(`https://dss03.crs4.it/v1/requestTrip/31-12-2001/` + pointStart + '/' + pointEnd + '/' + filter)

  }

  savePath() {

    const now = new Date();
    const timestamps = Number(now);

    return this.http.post<any>(`https://cmc-backend.crs4.it/routes`,
      {
        "origin": 2,
        "route": { "k": 4 },
        "created_at": timestamps
      }
      , { headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer 0e4d596a1d6ec5461fb7b48c1efe535702f6c69534a4c7e1ed96b02d08e1937cec211747b5d350bf5ae43a2dcfc11ab8870ee1bc4a3f3afaae37d34fb08548fb6fe3cc80b5c221c3f3d137df55a96318c985b97c6bbd1c225c4566700b4a443fe804536bea946db76eac189a397a281f46b1b6d688658229bbdd2e117879ae0a97e9c9946bb7d27d06e2460e5b82b27b0872e53f4bf00f49936232f2abf731e64f23a7fd87a1b3dc9f95f49bc7ad252098362973c5c38f195ea9e160871de593' } });

  }

  getAllPOIsNearToPoint(currentPoint) {
    this.http.get<any>(`https://dss03.crs4.it/v1/requestTrip/info/?lat=` + currentPoint.latitudine + `&lon=` + currentPoint.longitudine + '&distance=100&type=1,2,3,4')
      .subscribe(
        (data) => {
          this.poisNearToPointSource.next(data);
        }
      )
  }

  calculateGeometry(arrayGeometry): Observable<any> {
    let newGeometry = arrayGeometry.geometry.split("(")[1];

    newGeometry = newGeometry.replace("(", "");
    newGeometry = newGeometry.replace(")", "");
    newGeometry = newGeometry.replace(/ /g, "|");

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
    this.savedPathSource.next(this.tmpSavedPath)
  }

  removeSelectedPath(path) {
    this.tmpSelectedPath = this.tmpSelectedPath.filter(x => x.filter != path.filter)
    this.selectedPathSource.next(this.tmpSelectedPath)
  }

  removeSavedPath(path) {
    this.tmpSavedPath = this.tmpSavedPath.filter(x => x.filter != path.filter)
    this.savedPathSource.next(this.tmpSavedPath)
  }

  setToNullSelectedPath() {
    this.tmpSelectedPath = []
    this.selectedPathSource.next(this.tmpSelectedPath)
  }

  getSelectedPath() {
    return this.tmpSelectedPath
  }


  isPointOnLine(point, path) {
    //const current = L.latLng(point.longitudine, point.latitudine);
    for (var i = 0; i < path.geometry.length - 1; i++) {
      if (L.GeometryUtil.belongsSegment(L.latLng(point.longitudine, point.latitudine), L.latLng(path.geometry[i][0], path.geometry[i][1]), L.latLng(path.geometry[i + 1][0], path.geometry[i + 1][1]), 1)) {
        let segments = [];
        segments.push(path.geometry[i])
        segments.push(path.geometry[i + 1])
        let nodes = [];
        return {
          status: true,
          segment: [segments]
        }
      }
    }
    return {
      status: false,
      segment: []
    };
  }

  trackingUser(_map, point, path) {

    //const current = L.latLng(point.longitudine, point.latitudine);
    for (var i = 0; i < path.geometry.length; i++) {

      if (L.GeometryUtil.distance(_map, L.latLng(point.longitudine, point.latitudine), L.latLng(path.geometry[i][0], path.geometry[i][1])) <= 5) {

        return {
          status: true,
          node: {
            id: JSON.parse(path.nodes)[i],
            index: i
          },
          isLast: i == path.geometry.length
        }

      }

    }
    return {
      status: false,
      node: {},
      isLast: false
    };;
  }
}