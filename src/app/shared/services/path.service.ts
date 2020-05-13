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
    return this.http.get<any>(`https://dss03.crs4.it/v1/requestTrip/31-12-2001/` + pointStart + '/' + pointEnd + '/' + filter)
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
    this.tmpSelectedPath = this.tmpSelectedPath.filter(x => x.filter != path.filter)
    this.selectedPathSource.next(this.tmpSelectedPath)
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

        nodes.push(JSON.parse(path.nodes)[i])
        nodes.push(JSON.parse(path.nodes)[i + 1])
        return {
          status: true,
          segment: [segments],
          nodes: [nodes]
        }
      }
    }
    return {
      status: false,
      segment: []
    };
  }

  trackingUser(_map, point, path) {
    console.log(point)
    //const current = L.latLng(point.longitudine, point.latitudine);
    for (var i = 0; i < path.geometry.length; i++) {

      console.log(_map)
      console.log(L.latLng(point.longitudine, point.latitudine))
      console.log(L.latLng(path.geometry[i][0], path.geometry[i][1]))
      if (L.GeometryUtil.distance(_map, L.latLng(point.longitudine, point.latitudine), L.latLng(path.geometry[i][0], path.geometry[i][1])) <= 5) {

        return {
          status: true,
          node: JSON.parse(path.nodes)[i],
          isLast: i == path.geometry.length
        }

      }

    }
    return {
      status: false,
      node: [],
      isLast: false
    };;
  }
}