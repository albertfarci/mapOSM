import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

@Injectable()
export class MapConfigurationService {

    private sourceDestroy = new ReplaySubject<boolean>(null)
    destroy = this.sourceDestroy.asObservable()

    setPointA(value: boolean): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.sourceDestroy.next(value)
            resolve(true)
        })
    }

}