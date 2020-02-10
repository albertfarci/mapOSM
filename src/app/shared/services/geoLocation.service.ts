import { Injectable } from '@angular/core';
import { Filter } from '../models/filter.model';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Observable, from } from 'rxjs';
import { Point } from '../models/point.model';
import { mergeMap, map, filter } from 'rxjs/operators';
@Injectable()
export class GeoLocationService {

    checkPermission: boolean

    constructor(
        private androidPermissions: AndroidPermissions,
        private geolocation: Geolocation,
        private locationAccuracy: LocationAccuracy, ) { }

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
                        },
                        error => {
                            //Show alert if user click on 'No Thanks'
                            alert('requestPermission Error requesting location permissions ' + error)
                        }
                    );
            }
        });
    }

    askToTurnOnGPS() {
        this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
            () => {
                // When GPS Turned ON call method to get Accurate location coordinates
                //this.getLocationCoordinates()
                this.checkPermission = true
            },
            error => alert('Error requesting location permissions ' + JSON.stringify(error))
        );
    }

    getWatchCoordinates() {
        var options = { timeout: 1000 };

        return this.geolocation.watchPosition(options)
            .pipe(
                filter((p) => p.coords !== undefined),
                map(resp => {
                    return {
                        latitudine: resp.coords.latitude,
                        longitudine: resp.coords.longitude
                    } as Point
                }
                ));


    }

    // Methos to get device accurate coordinates using device GPS
    getLocationCoordinates(): Observable<Point> {

        return from(this.geolocation.getCurrentPosition({ enableHighAccuracy: true }))
            .pipe(
                map(resp => {
                    return {
                        latitudine: resp.coords.latitude,
                        longitudine: resp.coords.longitude
                    } as Point
                }
                ));

    }

    showLocation(position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        //alert("Latitude : " + latitude + " Longitude: " + longitude);
        console.log(latitude, longitude)
    }

    errorHandler(err) {
        if (err.code == 1) {
            alert("Error: Access is denied!");
        } else if (err.code == 2) {
            alert("Error: Position is unavailable!");
        }
    }

}