import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Point } from '../models/point.model';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import deepEqual from 'deep-equal';

@Injectable()
export class CurrentPointService {
    private readonly sourcePointA = new BehaviorSubject<Point>(null)
    currentPointA = this.sourcePointA.asObservable()
        .pipe(
            filter(a => a != null),
            distinctUntilChanged((a, b) => deepEqual(a, b)),
            filter(Boolean)
        ) as Observable<Point>

    private readonly sourcePointB = new BehaviorSubject<Point>(null)
    currentPointB = this.sourcePointB.asObservable()
        .pipe(
            filter(a => a != null),
            distinctUntilChanged((a, b) => deepEqual(a, b)),
            filter(Boolean)
        ) as Observable<Point>

    constructor() { }

    setPointA(point: Point): Promise<boolean> {
        return new Promise((resolve, reject) => {

            this.sourcePointA.next(point)
            resolve(true)
        })
    }
    setPointB(point: Point) {
        return new Promise((resolve, reject) => {

            this.sourcePointB.next(point)
            resolve(true)
        })
    }
}