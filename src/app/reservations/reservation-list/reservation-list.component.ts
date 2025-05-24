import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Reservation } from '../../models/reservation.model';
import { ReservationService } from '../reservation.service';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="card">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Lista de Reservaciones</h5>
          <button class="btn btn-light" routerLink="/reservations/new">
            Nueva Reservación
          </button>
        </div>
        
        <div class="card-body">
          <!-- Filtros -->
          <div class="row mb-4">
            <div class="col-md-3">
              <input type="text" class="form-control" placeholder="Buscar por nombre..." [(ngModel)]="searchTerm">
            </div>
            <div class="col-md-3">
              <select class="form-select" [(ngModel)]="statusFilter">
                <option value="">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div class="col-md-3">
              <input type="date" class="form-control" [(ngModel)]="dateFilter">
            </div>
          </div>

          <!-- Tabla -->
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th (click)="sort('customerName')">Cliente ⇅</th>
                  <th (click)="sort('date')">Fecha ⇅</th>
                  <th (click)="sort('time')">Hora ⇅</th>
                  <th (click)="sort('numberOfPeople')">Personas ⇅</th>
                  <th (click)="sort('status')">Estado ⇅</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let reservation of filteredReservations">
                  <td>{{ reservation.customerName }}</td>
                  <td>{{ reservation.date | date:'dd/MM/yyyy' }}</td>
                  <td>{{ reservation.time }}</td>
                  <td>{{ reservation.numberOfPeople }}</td>
                  <td>
                    <span class="badge" [ngClass]="{
                      'bg-warning': reservation.status === 'pending',
                      'bg-success': reservation.status === 'confirmed',
                      'bg-danger': reservation.status === 'cancelled'
                    }">{{ reservation.status }}</span>
                  </td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-sm btn-outline-primary" [routerLink]="['/reservations/edit', reservation.id]">
                        Editar
                      </button>
                      <button class="btn btn-sm btn-outline-danger" (click)="deleteReservation(reservation.id)">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredReservations.length === 0">
                  <td colspan="6" class="text-center">No hay reservaciones que coincidan con los filtros</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReservationListComponent implements OnInit {
  searchTerm: string = '';
  statusFilter: string = '';
  dateFilter: string = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  reservations: Reservation[] = [];

  constructor(private reservationService: ReservationService) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.reservationService.getReservations().subscribe({
      next: (data) => {
        this.reservations = data;
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
      }
    });
  }

  deleteReservation(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar esta reservación?')) {
      // Implementar la eliminación cuando tengamos el backend
      console.log('Eliminando reservación:', id);
    }
  }

  get filteredReservations(): Reservation[] {
    return this.reservations
      .filter(res => {
        const matchesSearch = res.customerName.toLowerCase().includes(this.searchTerm.toLowerCase());
        const matchesStatus = !this.statusFilter || res.status === this.statusFilter;
        const matchesDate = !this.dateFilter ||
          new Date(res.date).toISOString().split('T')[0] === this.dateFilter;
        return matchesSearch && matchesStatus && matchesDate;
      })
      .sort((a, b) => {
        if (!this.sortColumn) return 0;

        const direction = this.sortDirection === 'asc' ? 1 : -1;
        const aValue = a[this.sortColumn as keyof Reservation];
        const bValue = b[this.sortColumn as keyof Reservation];

        if (aValue < bValue) return -1 * direction;
        if (aValue > bValue) return 1 * direction;
        return 0;
      });
  }

  sort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }
}
