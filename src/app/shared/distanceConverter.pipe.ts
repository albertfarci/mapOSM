import { Pipe } from '@angular/core';

@Pipe({name:"distanceConverter"})
export class DistanceConverterPipe {
  transform(val) {
    var km =  Math.floor(val / 1000)
    if(km > 0){ 
      var metres= Math.floor( val - km * 1000)
      return  km+" km e "+ metres+" metri"
    } else{
      return val+" metri"
    }
    
  }
}