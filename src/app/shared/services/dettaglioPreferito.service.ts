import { Injectable } from '@angular/core';

@Injectable()
export class DettaglioPreferitoService {

    dettaglioPreferito

    setPreferito(item, rowId){
        this.dettaglioPreferito={
            item: item,
            id: rowId
        }
    }

}
