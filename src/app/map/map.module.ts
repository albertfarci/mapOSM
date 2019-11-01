import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MapPage } from './map.page';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { SharedModule } from '../shared/shared.module';

@NgModule({
    imports: [
      SharedModule,
      IonicModule,
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      RouterModule.forChild([{ path: '', component: MapPage }])
    ],
    declarations: [MapPage]
  })
  export class MapPageModule {}
  