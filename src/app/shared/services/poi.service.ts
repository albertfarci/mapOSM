import { Injectable } from '@angular/core';
import * as monuments from "../../../assets/jsonData/monuments.json";
import * as archeoSites from "../../../assets/jsonData/archeoSites.json";
import * as gardens from "../../../assets/jsonData/gardens.json";
import * as museums from "../../../assets/jsonData/museums.json";
import * as restaurants from "../../../assets/jsonData/restaurants.json";
import * as allPois from "../../../assets/jsonData/ristotrantiShoppingMonumentiMusei.json";

import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable()
export class PoiService {

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

    getPoisByString(searchString: string) {
        console.log(searchString)
        return this.http.get<any>(`http://156.148.14.188:8080/v1/requestTrip/ricerca_punti/?q=` + searchString)
    }
}
