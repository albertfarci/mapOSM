import { Pipe } from '@angular/core';

@Pipe({name:"pathLabel"})
export class PathLabelPipe {
  transform(val) {
    console.log(val)
    return JSON.parse(val).name
  }
}