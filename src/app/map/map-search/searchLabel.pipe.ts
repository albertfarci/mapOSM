import { Pipe } from '@angular/core';

@Pipe({ name: "searchLabel" })
export class SearchLabelPipe {
  transform(val) {
    if (val.title) return val.title
    if (val.label) return val.label

  }
}