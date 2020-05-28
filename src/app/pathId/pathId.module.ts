import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PathIdPage } from './pathId.page';
import { MapModalModalitaPage } from './map-modal-modalita/map-modal-modalita.page';
import { MapModalStartPage } from './map-modal-start/map-modal-start.page';
import { MapModalRicalcoloPage } from './map-modal-ricalcolo/map-modal-ricalcolo.page';
import { MapModalLastNodePage } from './map-modal-last-node/map-modal-last-node.page';
import { MapModalSegnalazionePage } from './map-modal-segnalazione/map-modal-segnalazione.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: PathIdPage }])
  ],
  entryComponents: [MapModalModalitaPage, MapModalStartPage, MapModalRicalcoloPage, MapModalLastNodePage, MapModalSegnalazionePage],
  declarations: [PathIdPage, MapModalModalitaPage, MapModalStartPage, MapModalRicalcoloPage, MapModalLastNodePage, MapModalSegnalazionePage]
})
export class PathIdPageModule { }
