import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class SegnalazioneService {

    constructor(private http: HttpClient) { }

    sendSegnalazione(data, currentPosition) {

        return this.http.post<any>(`https://cmc-backend.crs4.it/obstacles`, {
            "description": data.description,
            "mode": parseInt(data.mode),
            "severity": parseInt(data.severity),
            "tipology": parseInt(data.tipology),
            "origin": 2,
            "confirm": 1,
            "location": [currentPosition.longitudine, currentPosition.latitudine,]
        }, { headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer 0e4d596a1d6ec5461fb7b48c1efe535702f6c69534a4c7e1ed96b02d08e1937cec211747b5d350bf5ae43a2dcfc11ab8870ee1bc4a3f3afaae37d34fb08548fb6fe3cc80b5c221c3f3d137df55a96318c985b97c6bbd1c225c4566700b4a443fe804536bea946db76eac189a397a281f46b1b6d688658229bbdd2e117879ae0a97e9c9946bb7d27d06e2460e5b82b27b0872e53f4bf00f49936232f2abf731e64f23a7fd87a1b3dc9f95f49bc7ad252098362973c5c38f195ea9e160871de593' } });
    }

}