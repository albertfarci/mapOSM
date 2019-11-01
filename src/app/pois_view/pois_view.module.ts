import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PoisViewPage } from './pois_view.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
    imports: [
      IonicModule,
      CommonModule,
      FormsModule,
      RouterModule.forChild([{ path: '', component: PoisViewPage }]),
      SharedModule
    ],
    declarations: [PoisViewPage]
  })
  export class PoisViewPageModule {}
  