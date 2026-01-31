import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TourService } from '../../../core/services/tour.service';

@Component({
  standalone: true,
  selector: 'app-create-tour',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: '././create-tour.component.html'
})
export class CreateTourComponent {

  loading = false;
  error?: string;

  form = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    ciudad: [''],
    pais: [''],
    imagenUrl: [''],
    precio: [0, [Validators.required, Validators.min(1)]],
    latitud: [],
    longitud: []
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

    this.tourService.create(this.form.value as any).subscribe({
      next: () => {
        this.router.navigate(['/admin']);
      },
      error: err => {
        this.error = err.error?.message || 'Error al crear el tour';
        this.loading = false;
      }
    });
  }
}
