import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import Swal from 'sweetalert2';

import { Tour } from '../../../../core/models/tour.model';
import { TourCreate } from '../../../../core/models/tour-create.model';
import { TourService } from '../../../../core/services/tour.service';

type EstadoFiltro = 'TODOS' | 'ACTIVOS' | 'INACTIVOS';
type OrdenTours = 'RECIENTES' | 'NOMBRE' | 'PRECIO_ASC' | 'PRECIO_DESC';

@Component({
  standalone: true,
  selector: 'app-admin-tours',
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-tours.component.html',
  styleUrls: ['./admin-tours.component.css']
})
export class AdminToursComponent implements OnInit {
  readonly fallbackImage =
    'https://placehold.co/900x560/e2e8f0/475569?text=TurismoApp';

  tours: Tour[] = [];

  loading = true;
  error = '';

  busqueda = '';
  estadoFiltro: EstadoFiltro = 'TODOS';
  orden: OrdenTours = 'RECIENTES';

  editando: Tour | null = null;
  guardando = false;
  accionandoId: number | null = null;
  previewError = false;

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
    private readonly tourService: TourService
  ) {}

  ngOnInit(): void {
    this.cargarTours();
  }

  cargarTours(): void {
    this.loading = true;
    this.error = '';

    this.tourService.listarAdmin().subscribe({
      next: (tours) => {
        this.tours = tours ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando tours:', err);
        this.error =
          err?.error?.message || 'No fue posible cargar los tours.';
        this.loading = false;
      }
    });
  }

  get toursFiltrados(): Tour[] {
    const texto = this.busqueda.trim().toLowerCase();

    let resultado = [...this.tours];

    if (this.estadoFiltro === 'ACTIVOS') {
      resultado = resultado.filter((tour) => tour.activo);
    }

    if (this.estadoFiltro === 'INACTIVOS') {
      resultado = resultado.filter((tour) => !tour.activo);
    }

    if (texto) {
      resultado = resultado.filter((tour) =>
        [
          tour.nombre,
          tour.descripcion,
          tour.ciudad,
          tour.pais
        ]
          .filter(Boolean)
          .some((valor) => valor.toLowerCase().includes(texto))
      );
    }

    return resultado.sort((a, b) => {
      switch (this.orden) {
        case 'NOMBRE':
          return a.nombre.localeCompare(b.nombre);

        case 'PRECIO_ASC':
          return Number(a.precio ?? 0) - Number(b.precio ?? 0);

        case 'PRECIO_DESC':
          return Number(b.precio ?? 0) - Number(a.precio ?? 0);

        default:
          return b.id - a.id;
      }
    });
  }

  get totalTours(): number {
    return this.tours.length;
  }

  get toursActivos(): number {
    return this.tours.filter((tour) => tour.activo).length;
  }

  get toursInactivos(): number {
    return this.tours.filter((tour) => !tour.activo).length;
  }

  get coordenadasIncompletas(): boolean {
    const { latitud, longitud } = this.form.getRawValue();

    const tieneLatitud = latitud !== null;
    const tieneLongitud = longitud !== null;

    return tieneLatitud !== tieneLongitud;
  }

  abrirEditar(tour: Tour): void {
    this.error = '';
    this.previewError = false;
    this.editando = tour;

    this.form.reset({
      nombre: tour.nombre ?? '',
      descripcion: tour.descripcion ?? '',
      ciudad: tour.ciudad ?? '',
      pais: tour.pais ?? 'Colombia',
      imagenUrl: tour.imagenUrl ?? '',
      precio: Number(tour.precio ?? 0),
      latitud: tour.latitud ?? null,
      longitud: tour.longitud ?? null
    });

    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  cerrarEditar(): void {
    if (this.guardando) {
      return;
    }

    this.editando = null;
    this.previewError = false;

    this.form.reset({
      nombre: '',
      descripcion: '',
      ciudad: '',
      pais: 'Colombia',
      imagenUrl: '',
      precio: 0,
      latitud: null,
      longitud: null
    });
  }

  guardarCambios(): void {
    if (!this.editando) {
      return;
    }

    if (this.form.invalid || this.coordenadasIncompletas) {
      this.form.markAllAsTouched();

      Swal.fire({
        icon: 'warning',
        title: 'Revisa la información',
        text: this.coordenadasIncompletas
          ? 'Debes registrar latitud y longitud juntas, o dejar ambas vacías.'
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

    this.guardando = true;

    this.tourService.actualizar(this.editando.id, dto).subscribe({
      next: async (tourActualizado) => {
        this.tours = this.tours.map((tour) =>
          tour.id === tourActualizado.id ? tourActualizado : tour
        );

        this.guardando = false;
        this.cerrarEditar();

        await Swal.fire({
          icon: 'success',
          title: 'Tour actualizado',
          text: 'Los cambios fueron guardados correctamente.',
          timer: 1600,
          showConfirmButton: false
        });
      },
      error: async (err) => {
        console.error('Error actualizando tour:', err);
        this.guardando = false;

        await Swal.fire({
          icon: 'error',
          title: 'No se pudo actualizar el tour',
          text:
            err?.error?.message ||
            'Ocurrió un error al guardar los cambios.'
        });
      }
    });
  }

  async cambiarEstado(tour: Tour): Promise<void> {
    const activar = !tour.activo;

    const confirmacion = await Swal.fire({
      icon: 'question',
      title: activar ? '¿Activar tour?' : '¿Desactivar tour?',
      html: `
        <p>Vas a ${activar ? 'activar' : 'desactivar'}:</p>
        <strong>${this.escapeHtml(tour.nombre)}</strong>
      `,
      showCancelButton: true,
      confirmButtonText: activar ? 'Sí, activar' : 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: activar ? '#15803d' : '#b45309'
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    this.accionandoId = tour.id;

    this.tourService.toggleActivo(tour.id, activar).subscribe({
      next: async () => {
        this.tours = this.tours.map((item) =>
          item.id === tour.id ? { ...item, activo: activar } : item
        );

        this.accionandoId = null;

        await Swal.fire({
          icon: 'success',
          title: activar ? 'Tour activado' : 'Tour desactivado',
          text: activar
            ? 'El tour vuelve a estar disponible para los usuarios.'
            : 'El tour ya no se mostrará en el catálogo público.',
          timer: 1600,
          showConfirmButton: false
        });
      },
      error: async (err) => {
        console.error('Error cambiando estado:', err);
        this.accionandoId = null;

        await Swal.fire({
          icon: 'error',
          title: 'No se pudo cambiar el estado',
          text: err?.error?.message || 'Intenta nuevamente.'
        });
      }
    });
  }

  async eliminarTour(tour: Tour): Promise<void> {
    if (tour.activo) {
      await Swal.fire({
        icon: 'info',
        title: 'Primero desactiva el tour',
        text:
          'Por seguridad, un tour activo no puede eliminarse directamente. Desactívalo primero.'
      });

      return;
    }

    const confirmacion = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar tour definitivamente?',
      html: `
        <p>Vas a eliminar:</p>
        <strong>${this.escapeHtml(tour.nombre)}</strong>
        <p class="mt-3 text-muted">
          Esta acción puede ser rechazada si el tour tiene reservas asociadas.
        </p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#b91c1c',
      reverseButtons: true
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    this.accionandoId = tour.id;

    this.tourService.eliminar(tour.id).subscribe({
      next: async () => {
        this.tours = this.tours.filter((item) => item.id !== tour.id);
        this.accionandoId = null;

        await Swal.fire({
          icon: 'success',
          title: 'Tour eliminado',
          text: 'El tour fue eliminado correctamente.',
          timer: 1600,
          showConfirmButton: false
        });
      },
      error: async (err) => {
        console.error('Error eliminando tour:', err);
        this.accionandoId = null;

        await Swal.fire({
          icon: 'error',
          title: 'No se puede eliminar el tour',
          text:
            err?.error?.message ||
            'El tour puede tener reservas asociadas. Déjalo desactivado.'
        });
      }
    });
  }

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (image.src !== this.fallbackImage) {
      image.src = this.fallbackImage;
    }
  }

  onPreviewError(): void {
    this.previewError = true;
  }

  trackByTour(_: number, tour: Tour): number {
    return tour.id;
  }

  esAccionando(tour: Tour): boolean {
    return this.accionandoId === tour.id;
  }

  private escapeHtml(valor: string): string {
    return valor
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
