import { Pipe } from '@angular/core';

@Pipe({name:"abstract"})
export class AbstractPipe {
  transform(val) {
    console.log(val.abstract.length)
    if (val.abstract.length> 50 ) 
      return val.abstract.substring(0,50) + ".."
    
    return val.abstract
  }
}