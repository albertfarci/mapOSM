import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MapPage } from './map.page';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { SharedModule } from '../shared/shared.module';
import { MapDisplayComponent } from './map-display/map-display.component';
import { MapSearchComponent } from '../map-search/map-search/map-search.component';
import { SearchLabelPipe } from '../map-search/map-search/searchLabel.pipe';
import { PoiDescriptionComponent } from './map-display/poi-description/poi-description.component';
import { PathService } from '../shared/services/path.service';
import { MapModalPage } from './map-modal/map-modal.page';
import { MapModalModalitaPage } from './map-modal-modalita/map-modal-modalita.page';
import { MapModalStoragePage } from './map-modal-storage/map-modal-storage.page';
import { MapModalNavigationPage } from './map-modal-storage/map-modal-navigation/map-modal-navigation.page';

@NgModule({
  imports: [
    SharedModule,
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: MapPage }]),
  ],
  entryComponents: [MapModalPage, MapModalModalitaPage, MapModalStoragePage, MapModalNavigationPage],
  providers: [PathService],
  declarations: [MapPage, MapDisplayComponent, PoiDescriptionComponent, MapModalPage, MapModalStoragePage, MapModalModalitaPage, MapModalNavigationPage]
})
export class MapPageModule { }
