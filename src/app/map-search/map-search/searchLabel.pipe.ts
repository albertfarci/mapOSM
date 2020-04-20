import { Pipe } from '@angular/core';

@Pipe({ name: "searchLabel" })
export class SearchLabelPipe {
  transform(val) {
    console.log(val)
    return val.toUpperCase()

  }
}