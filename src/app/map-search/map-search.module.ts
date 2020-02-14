import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapSearchPage } from './map-search.page';
import { NgModule } from '@angular/core';
import { MapSearchComponent } from './map-search/map-search.component';
import { SearchLabelPipe } from './map-search/searchLabel.pipe';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        RouterModule.forChild([{ path: '', component: MapSearchPage }])
    ],
    declarations: [MapSearchPage, SearchLabelPipe, MapSearchComponent]
})
export class MapSearchPageModule { }
