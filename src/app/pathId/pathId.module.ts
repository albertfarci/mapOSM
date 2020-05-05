import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PathIdPage } from './pathId.page';
import { MapModalModalitaPage } from './map-modal-modalita/map-modal-modalita.page';
import { MapModalStartPage } from './map-modal-start/map-modal-start.page';
import { MapModalRicalcoloPage } from './map-modal-ricalcolo/map-modal-ricalcolo.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: PathIdPage }])
  ],
  entryComponents: [MapModalModalitaPage, MapModalStartPage, MapModalRicalcoloPage],
  declarations: [PathIdPage, MapModalModalitaPage, MapModalStartPage, MapModalRicalcoloPage]
})
export class PathIdPageModule { }
