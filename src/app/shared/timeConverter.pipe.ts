import { Pipe } from '@angular/core';

@Pipe({name:"timeConverter"})
export class TimeConverterPipe {
  transform(val) {
    var hours =  Math.floor(val / 3600)
    if(hours > 0){ 
      var minutes= Math.floor(val/60 ) - (hours *60)
      return  hours+" ore e "+ minutes+" minuti"
    } else{
      var minutes= Math.floor(val/60 ) 
      return minutes+" minuti"
    }
    
  }
}