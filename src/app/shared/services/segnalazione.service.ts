import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class SegnalazioneService {

    constructor(private http: HttpClient) { }

    sendSegnalazione(data, tipo, messaggio, punto) {

        return this.http.post<any>(`http://156.148.14.188:8080/v1/requestTrip/salvataggio_messaggi/?data=` + data + `tipo=` + tipo + `&messaggio=` + messaggio + `&punto=` + punto, {});
    }

}