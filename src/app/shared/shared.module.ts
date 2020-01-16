import { NgModule } from '@angular/core';
import { LabelPipe } from './label.pipe';
import { CommonModule } from '@angular/common';
import { AbstractPipe } from './abstract.pipe';
import { TimeConverterPipe } from './timeConverter.pipe';
import { DistanceConverterPipe } from './distanceConverter.pipe';

@NgModule({
    declarations: [LabelPipe,AbstractPipe, TimeConverterPipe,DistanceConverterPipe],
    imports: [CommonModule],
    exports: [LabelPipe,AbstractPipe, TimeConverterPipe,DistanceConverterPipe]
  })
  export class SharedModule {}
  