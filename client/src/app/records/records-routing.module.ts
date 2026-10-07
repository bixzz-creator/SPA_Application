import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecordListComponent } from './record-list/record-list.component';

const routes: Routes = [
  {
    path: '',
    component: RecordListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecordsRoutingModule {}
