import { Injectable } from '@angular/core';

@Injectable()
export class PreferitiService {

    preferito;
    setPeriti(item) {
        this.preferito = item
    }

}