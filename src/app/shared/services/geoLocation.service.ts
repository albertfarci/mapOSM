import { Injectable } from '@angular/core';
import { Filter } from '../models/filter.model';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { Point } from '../models/point.model';
import { mergeMap, map, filter, distinctUntilChanged } from 'rxjs/operators';
import { CurrentPointService } from './current-points.service';
import deepEqual from 'deep-equal';
import { HttpClient } from '@angular/common/http';
@Injectable()
export class GeoLocationService {


    private checkRicalcoloSource: boolean = true

    private readonly checkPermissionSource = new BehaviorSubject<boolean>(false)
    checkPermission = this.checkPermissionSource.asObservable()

    private readonly currentPositionSource = new BehaviorSubject<Point>(null)
    currentPosition = this.currentPositionSource.asObservable()/*.pipe(
        filter(a => a != null),
        distinctUntilChanged((a, b) => deepEqual(a, b)),
        filter(Boolean)
    ) as Observable<Point>*/

    constructor(
        private androidPermissions: AndroidPermissions,
        private geolocation: Geolocation,
        private locationAccuracy: LocationAccuracy,
        private http: HttpClient,
        private currentPointsService: CurrentPointService) { }


    getCheckRicalcolo() {
        return this.checkRicalcoloSource
    }
    //Check if application having GPS access permission  
    checkGPSPermission() {

        this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
            result => {

                if (result.hasPermission) {

                    //If having permission show 'Turn On GPS' dialogue
                    this.askToTurnOnGPS();
                } else {

                    //If not having permission ask for permission
                    this.requestGPSPermission();
                }
            },
            err => {
                alert(err);
            }
        );

    }

    requestGPSPermission() {
        this.locationAccuracy.canRequest().then((canRequest: boolean) => {
            if (canRequest) {
            } else {
                //Show 'GPS Permission Request' dialogue
                this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
                    .then(
                        () => {
                            // call method to turn on GPS
                            this.askToTurnOnGPS();
                        }
                    );
            }
        });
    }

    askToTurnOnGPS() {
        this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
            () => {
                // When GPS Turned ON call method to get Accurate location coordinates
                this.getLocationCoordinates()
                this.checkPermissionSource.next(true)
            }
        );
    }

    checkGPSPermissionHome() {

        this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
            result => {

                if (result.hasPermission) {

                    //If having permission show 'Turn On GPS' dialogue
                    this.askToTurnOnGPSForHome();
                } else {

                    //If not having permission ask for permission
                    this.requestGPSPermissionHome();
                }
            },
            err => {
                alert(err);
            }
        );

    }

    requestGPSPermissionHome() {
        this.locationAccuracy.canRequest().then((canRequest: boolean) => {
            if (canRequest) {
            } else {
                //Show 'GPS Permission Request' dialogue
                this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
                    .then(
                        () => {
                            // call method to turn on GPS
                            this.askToTurnOnGPS();
                        },
                        error => {
                            //Show alert if user click on 'No Thanks'
                            alert('requestPermission Error requesting location permissions ' + error)
                        }
                    );
            }
        });
    }

    askToTurnOnGPSForHome() {
        this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
            () => {
                // When GPS Turned ON call method to get Accurate location coordinates
                //this.getLocationCoordinates()
                this.checkPermissionSource.next(true)
            },
            error => alert(error.message)
        );
    }

    // Methos to get device accurate coordinates using device GPS
    getLocationCoordinates() {

        this.geolocation.getCurrentPosition({ enableHighAccuracy: true }).then(
            resp => {
                //this.currentPointsService.setPointA({ latitudine: resp.coords.latitude, longitudine: resp.coords.longitude, title: "Posizione corrente", img: "", abstract: "" })
                this.currentPositionSource.next({ latitudine: resp.coords.latitude, longitudine: resp.coords.longitude, title: "Posizione corrente", img: "", abstract: "" })
            }
        )
    }


    getLocationCoordinatesSetup() {
        if (this.checkRicalcoloSource) {
            //this.getLocationCoordinates()
            this.checkGPSPermission()
        }
    }


    // Methos to get device accurate coordinates using device GPS
    getLocationCoordinatesPromise(): Observable<Point> {
        return from(this.geolocation.getCurrentPosition({ enableHighAccuracy: true }))
            .pipe(
                map(resp => {
                    return {
                        latitudine: resp.coords.latitude,
                        longitudine: resp.coords.longitude
                    } as Point

                })
            )

    }

    showLocation(position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
    }

    errorHandler(err) {
        if (err.code == 1) {
            alert("Error: Access is denied!");
        } else if (err.code == 2) {
            alert("Error: Position is unavailable!");
        }
    }

    setChechRicalcolo(value) {
        this.checkRicalcoloSource = value
    }

    sendTrackingUserData(tracking, timestamps, modalita) {
        return this.http.post<any>(`https://cmc-backend.crs4.it/segments`,
            {
                "pointSegment": [
                    tracking.segment[0][0], tracking.segment[0][1]
                ],
                "mode": modalita,
                "distance": 0,
                "valid": 1,
                "timestamps": timestamps
            }
            , { headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer 0e4d596a1d6ec5461fb7b48c1efe535702f6c69534a4c7e1ed96b02d08e1937cec211747b5d350bf5ae43a2dcfc11ab8870ee1bc4a3f3afaae37d34fb08548fb6fe3cc80b5c221c3f3d137df55a96318c985b97c6bbd1c225c4566700b4a443fe804536bea946db76eac189a397a281f46b1b6d688658229bbdd2e117879ae0a97e9c9946bb7d27d06e2460e5b82b27b0872e53f4bf00f49936232f2abf731e64f23a7fd87a1b3dc9f95f49bc7ad252098362973c5c38f195ea9e160871de593' } });

    }

}