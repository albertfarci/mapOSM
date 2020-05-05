import { Pipe } from '@angular/core';

@Pipe({ name: "searchLabel" })
export class SearchLabelPipe {
  transform(val) {
    return val.toUpperCase()

  }
}