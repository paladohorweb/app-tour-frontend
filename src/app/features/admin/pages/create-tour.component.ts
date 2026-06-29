import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

import { TourCreate } from '../../../core/models/tour-create.model';
import { TourService } from '../../../core/services/tour.service';

@Component({
  standalone: true,
  selector: 'app-create-tour',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-tour.component.html',
  styleUrls: ['./create-tour.component.css']
})
export class CreateTourComponent {
  loading = false;
  imagePreviewError = false;

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: ['', [Validators.maxLength(1000)]],
    ciudad: ['', [Validators.required, Validators.minLength(2)]],
    pais: ['Colombia', [Validators.required, Validators.minLength(2)]],
    imagenUrl: ['', [Validators.maxLength(1000)]],
    precio: this.fb.nonNullable.control(0, [
      Validators.required,
      Validators.min(1)
    ]),
    latitud: this.fb.control<number | null>(null, [
      Validators.min(-90),
      Validators.max(90)
    ]),
    longitud: this.fb.control<number | null>(null, [
      Validators.min(-180),
      Validators.max(180)
    ])
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly tourService: TourService,
    private readonly router: Router
  ) {}

  get coordenadasIncompletas(): boolean {
    const { latitud, longitud } = this.form.getRawValue();

    return (latitud !== null) !== (longitud !== null);
  }

  submit(): void {
    if (this.form.invalid || this.coordenadasIncompletas) {
      this.form.markAllAsTouched();

      Swal.fire({
        icon: 'warning',
        title: 'Revisa la información',
        text: this.coordenadasIncompletas
          ? 'Debes ingresar latitud y longitud juntas, o dejar ambas vacías.'
          : 'Completa correctamente los campos obligatorios.'
      });

      return;
    }

    const valores = this.form.getRawValue();

    const dto: TourCreate = {
      nombre: valores.nombre.trim(),
      descripcion: valores.descripcion.trim(),
      ciudad: valores.ciudad.trim(),
      pais: valores.pais.trim(),
      imagenUrl: valores.imagenUrl.trim(),
      precio: Number(valores.precio),
      latitud: valores.latitud,
      longitud: valores.longitud
    };

    this.loading = true;

    this.tourService.crear(dto).subscribe({
      next: async () => {
        this.loading = false;

        await Swal.fire({
          icon: 'success',
          title: 'Tour creado',
          text: 'La nueva experiencia fue creada correctamente.',
          confirmButtonText: 'Ver tours'
        });

        this.router.navigate(['/admin/tours']);
      },
      error: async (err) => {
        console.error('Error creando tour:', err);
        this.loading = false;

        await Swal.fire({
          icon: 'error',
          title: 'No se pudo crear el tour',
          text:
            err?.error?.message ||
            'Ocurrió un error al crear la experiencia.'
        });
      }
    });
  }

  onImageError(): void {
    this.imagePreviewError = true;
  }

  resetPreview(): void {
    this.imagePreviewError = false;
  }
}
