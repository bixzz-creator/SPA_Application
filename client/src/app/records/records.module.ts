import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { RecordsRoutingModule } from './records-routing.module';
import { RecordListComponent } from './record-list/record-list.component';

@NgModule({
  declarations: [RecordListComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RecordsRoutingModule,
  ],
})
export class RecordsModule {}
