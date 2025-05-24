import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationService } from '../reservation.service';
import { Reservation } from '../../models/reservation.model';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mt-4">
      <div class="card">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">{{ isEditing ? 'Editar' : 'Nueva' }} Reservación</h5>
        </div>
        <div class="card-body">
          <form [formGroup]="reservationForm" (ngSubmit)="onSubmit()">
            <div class="mb-3">
              <label for="customerName" class="form-label">Nombre del Cliente</label>
              <input type="text" class="form-control" id="customerName" formControlName="customerName">
              <div class="text-danger" *ngIf="reservationForm.get('customerName')?.errors?.['required'] && reservationForm.get('customerName')?.touched">
                El nombre del cliente es requerido
              </div>
            </div>

            <div class="mb-3">
              <label for="date" class="form-label">Fecha</label>
              <input type="date" class="form-control" id="date" formControlName="date">
              <div class="text-danger" *ngIf="reservationForm.get('date')?.errors?.['required'] && reservationForm.get('date')?.touched">
                La fecha es requerida
              </div>
            </div>

            <div class="mb-3">
              <label for="time" class="form-label">Hora</label>
              <input type="time" class="form-control" id="time" formControlName="time">
              <div class="text-danger" *ngIf="reservationForm.get('time')?.errors?.['required'] && reservationForm.get('time')?.touched">
                La hora es requerida
              </div>
            </div>

            <div class="mb-3">
              <label for="numberOfPeople" class="form-label">Número de Personas</label>
              <input type="number" class="form-control" id="numberOfPeople" formControlName="numberOfPeople" min="1">
              <div class="text-danger" *ngIf="reservationForm.get('numberOfPeople')?.errors?.['required'] && reservationForm.get('numberOfPeople')?.touched">
                El número de personas es requerido
              </div>
              <div class="text-danger" *ngIf="reservationForm.get('numberOfPeople')?.errors?.['min']">
                Debe ser al menos 1 persona
              </div>
            </div>

            <div class="mb-3">
              <label for="status" class="form-label">Estado</label>
              <select class="form-select" id="status" formControlName="status">
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>

            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-primary" [disabled]="reservationForm.invalid">
                {{ isEditing ? 'Actualizar' : 'Crear' }} Reservación
              </button>
              <button type="button" class="btn btn-secondary" (click)="onCancel()">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ReservationFormComponent implements OnInit {
  reservationForm: FormGroup;
  isEditing = false;
  private reservationId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.reservationForm = this.fb.group({
      customerName: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      numberOfPeople: ['', [Validators.required, Validators.min(1)]],
      status: ['pending', Validators.required]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.reservationId = +id;
      this.loadReservation(this.reservationId);
    }
  }

  loadReservation(id: number): void {
    this.reservationService.getReservationById(id).subscribe({
      next: (reservation: Reservation) => {
        if (reservation) {
          this.reservationForm.patchValue({
            customerName: reservation.customerName,
            date: new Date(reservation.date).toISOString().split('T')[0],
            time: reservation.time,
            numberOfPeople: reservation.numberOfPeople,
            status: reservation.status
          });
        }
      },
      error: (error: Error) => {
        console.error('Error loading reservation:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.reservationForm.valid) {
      const reservationData: Omit<Reservation, 'id'> = {
        customerName: this.reservationForm.value.customerName || '',
        date: this.reservationForm.value.date || new Date().toISOString().split('T')[0],
        time: this.reservationForm.value.time || '',
        numberOfPeople: this.reservationForm.value.numberOfPeople || 1,
        status: this.reservationForm.value.status || 'pending'
      };

      if (this.reservationId) {
        this.reservationService.updateReservation(this.reservationId, reservationData).subscribe({
          next: () => this.router.navigate(['/reservations']),
          error: (error: Error) => console.error('Error updating reservation:', error)
        });
      } else {
        this.reservationService.createReservation(reservationData).subscribe({
          next: () => this.router.navigate(['/reservations']),
          error: (error: Error) => console.error('Error creating reservation:', error)
        });
      }
    }
  }

  onCancel() {
    this.router.navigate(['/reservations']);
  }
} 