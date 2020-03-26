import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PathIdPage } from './pathId.page';
import { MapModalModalitaPage } from './map-modal-modalita/map-modal-modalita.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: PathIdPage }])
  ],
  entryComponents: [MapModalModalitaPage],
  declarations: [PathIdPage, MapModalModalitaPage]
})
export class PathIdPageModule { }
