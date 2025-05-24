import { Routes } from '@angular/router';
import { ReservationListComponent } from './reservations/reservation-list/reservation-list.component';
import { ReservationFormComponent } from './reservations/reservation-form/reservation-form.component';

export const routes: Routes = [
  { path: 'reservations', component: ReservationListComponent },
  { path: 'reservations/new', component: ReservationFormComponent },
  { path: 'reservations/edit/:id', component: ReservationFormComponent },
  { path: '', redirectTo: '/reservations', pathMatch: 'full' }
];
