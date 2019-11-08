import { Pipe } from '@angular/core';

@Pipe({name:"pathValue"})
export class PathValuePipe {
  transform(val) {
    console.log(val)
    return JSON.parse(val).value
  }
}