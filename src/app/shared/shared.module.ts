import { NgModule } from '@angular/core';
import { LabelPipe } from './label.pipe';
import { CommonModule } from '@angular/common';
import { AbstractPipe } from './abstract.pipe';

@NgModule({
    declarations: [LabelPipe,AbstractPipe],
    imports: [CommonModule],
    exports: [LabelPipe,AbstractPipe]
  })
  export class SharedModule {}
  