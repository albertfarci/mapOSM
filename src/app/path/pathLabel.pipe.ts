import { Pipe } from '@angular/core';

@Pipe({ name: "pathLabel" })
export class PathLabelPipe {
  transform(val) {
    return JSON.parse(val).nome
  }
}