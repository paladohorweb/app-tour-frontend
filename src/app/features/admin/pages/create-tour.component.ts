import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TourService } from '../../../core/services/tour.service';
import { TourCreate } from '../../../core/models/tour-create.model';

@Component({
  standalone: true,
  selector: 'app-create-tour',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: '././create-tour.component.html'
})
export class CreateTourComponent {

  loading = false;
  error?: string;

form = this.fb.nonNullable.group({
  nombre: ['', Validators.required],
  descripcion: [''],
  ciudad: [''],
  pais: [''],
  imagenUrl: [''],
  precio: 0,
  latitud: this.fb.control<number | null>(null),
  longitud: this.fb.control<number | null>(null),
});

  constructor(
    private fb: FormBuilder,
    private tourService: TourService,
    private router: Router
  ) {}

 submit(): void {
  if (this.form.invalid) return;

  this.loading = true;
  this.error = undefined;

  const dto: TourCreate = this.form.getRawValue();
  dto.precio = Number(dto.precio);

  this.tourService.crear(dto).subscribe({
    next: () => this.router.navigate(['/admin/tours']),
    error: err => {
      this.error = err.error?.message || 'Error al crear el tour';
      this.loading = false;
    }
  });
}
}
