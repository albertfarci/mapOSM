import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MapPage } from './map.page';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { SharedModule } from '../shared/shared.module';
import { MapDisplayComponent } from './map-display/map-display.component';
import { MapSearchComponent } from './map-search/map-search.component';
import { SearchLabelPipe } from './map-search/searchLabel.pipe';
import { PoiDescriptionComponent } from './map-display/poi-description/poi-description.component';
import { MapPointsSelectionComponent } from './map-points-selection/map-points-selection.component';
import { PathService } from '../shared/services/path.service';

@NgModule({
  imports: [
    SharedModule,
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: MapPage }])
  ],
  providers: [PathService],
  declarations: [MapPage, SearchLabelPipe, MapDisplayComponent, MapSearchComponent, MapPointsSelectionComponent, PoiDescriptionComponent]
})
export class MapPageModule { }
