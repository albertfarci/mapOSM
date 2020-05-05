import { Injectable } from '@angular/core';
import * as monuments from "../../../assets/jsonData/monuments.json";
import * as archeoSites from "../../../assets/jsonData/archeoSites.json";
import * as gardens from "../../../assets/jsonData/gardens.json";
import * as museums from "../../../assets/jsonData/museums.json";
import * as restaurants from "../../../assets/jsonData/restaurants.json";
import * as allPois from "../../../assets/jsonData/ristotrantiShoppingMonumentiMusei.json";

import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class PoiService {


    private readonly currentPOIsSource = new BehaviorSubject<any>(null)
    currentPOIs = this.currentPOIsSource.asObservable()

    constructor(private http: HttpClient) { }

    getMonuments() {
        return JSON.stringify(monuments)
    }

    getArcheoSites() {
        return JSON.stringify(archeoSites)
    }

    getGardens() {
        return JSON.stringify(gardens)
    }

    getMuseums() {
        return JSON.stringify(museums)
    }

    getRestaurants() {
        return JSON.stringify(restaurants)
    }

    getAllPois() {
        return JSON.stringify(allPois)
    }

    setCurrentPois(poiList) {
        this.currentPOIsSource.next(poiList);
    }

    getPoisByString(searchString: string) {
        return this.http.get<any>(`https://dss03.crs4.it/v1/requestTrip/ricerca_punti/?q=` + searchString)
    }
}
