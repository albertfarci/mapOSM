import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class SegnalazioneService {

    constructor(private http: HttpClient) { }

    sendSegnalazione(data) {


        return this.http.post<any>(`https://dss03.crs4.it/v1/obstacles`, {
            "description": data.description,
            "mode": data.mode,
            "roadSegment": data.roadSegment,
            "severity": data.severity,
            "timestamp": data.timestamp,
            "tipology": data.tipology
        }
            , { headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ca5d91ad5020ed55c709c40f00f7510f1338ad9e' } });
    }

}