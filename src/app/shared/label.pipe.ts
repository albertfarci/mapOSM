import { Pipe } from '@angular/core';

@Pipe({name:"label"})
export class LabelPipe {
  transform(val) {
    if (val.label ) 
      return val.label;
    
    return val.title
  }
}