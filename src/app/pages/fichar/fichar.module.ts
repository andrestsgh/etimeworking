import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { FicharPageRoutingModule } from './fichar-routing.module';

import { FicharPage } from './fichar.page';
import { GoogleChartsModule } from 'angular-google-charts';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FicharPageRoutingModule,
    GoogleChartsModule
  ],
  declarations: [FicharPage],
  providers: [DatePipe]
})
export class FicharPageModule {}
