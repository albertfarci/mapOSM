import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { filter } from 'rxjs/operators'

@Injectable()
export class CurrentStepService {
    private readonly sourceStep = new BehaviorSubject<number>(1)
    currentStep = this.sourceStep.asObservable()
        .pipe(
            filter(a => a != null)) as Observable<number>

    constructor() { }

    setStep(step: number): Promise<boolean> {
        return new Promise((resolve, reject) => {

            console.log(step)
            this.sourceStep.next(step)
            resolve(true)
        })
    }
}