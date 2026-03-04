import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormsModule
} from '@angular/forms';

import { TourService } from '../../../../core/services/tour.service';
import { Tour } from '../../../../core/models/tour.model';
import { TourCreate } from '../../../../core/models/tour-create.model';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-tours.component.html',
  styleUrls: ['./admin-tours.component.css']
})
export class AdminToursComponent implements OnInit {
  loading = true;

  // mensajes UI
  errorGlobal = '';
  actionMsg = '';

  // search + filter
  q = '';
  showInactive = false;

  // data
  tours: Tour[] = [];

  // modal edit
  editing: Tour | null = null;
  saving = false;

  // para deshabilitar botones por tour
  private busyIds = new Set<number>();

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: [''],
    ciudad: [''],
    pais: [''],
    imagenUrl: [''],
    latitud: this.fb.control<number | null>(null),
    longitud: this.fb.control<number | null>(null),
    precio: this.fb.nonNullable.control(0, [Validators.required, Validators.min(1)])
  });

  constructor(private tourService: TourService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.errorGlobal = '';
    this.actionMsg = '';

    this.tourService.listarAdmin().subscribe({
      next: (res) => {
        this.tours = res ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorGlobal = err?.error?.message || 'No se pudieron cargar los tours';
        this.loading = false;
      }
    });
  }

  // ======== filtro + búsqueda ========
  get toursFiltrados(): Tour[] {
    const term = this.q.trim().toLowerCase();

    let base = this.showInactive ? this.tours : this.tours.filter(t => !!t.activo);

    if (!term) return base;

    return base.filter(t =>
      (t.nombre ?? '').toLowerCase().includes(term) ||
      (t.ciudad ?? '').toLowerCase().includes(term) ||
      (t.pais ?? '').toLowerCase().includes(term)
    );
  }

  // ======== modal editar ========
  abrirEditar(t: Tour): void {
    this.errorGlobal = '';
    this.actionMsg = '';
    this.editing = t;

    this.form.patchValue({
      nombre: t.nombre ?? '',
      descripcion: t.descripcion ?? '',
      ciudad: t.ciudad ?? '',
      pais: t.pais ?? '',
      imagenUrl: t.imagenUrl ?? '',
      latitud: t.latitud ?? null,
      longitud: t.longitud ?? null,
      precio: (t.precio ?? 0) as number
    });
  }

  cerrarEditar(): void {
    this.editing = null;
    this.saving = false;

    this.form.reset({
      nombre: '',
      descripcion: '',
      ciudad: '',
      pais: '',
      imagenUrl: '',
      latitud: null,
      longitud: null,
      precio: 0
    });
  }

  guardar(): void {
    if (!this.editing) return;

    this.errorGlobal = '';
    this.actionMsg = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;

    // DTO exacto que espera tu backend (TourRequestDTO)
    const dto: TourCreate = this.form.getRawValue();

    this.tourService.actualizar(this.editing.id, dto).subscribe({
      next: (updated) => {
        this.tours = this.tours.map(x => (x.id === updated.id ? updated : x));
        this.actionMsg = 'Tour actualizado ✅';
        this.saving = false;
        this.cerrarEditar();
      },
      error: (err) => {
        console.error(err);
        this.errorGlobal = err?.error?.message || 'Error actualizando tour';
        this.saving = false;
      }
    });
  }

  // ======== activación ========
  toggleActivo(t: Tour): void {
    this.errorGlobal = '';
    this.actionMsg = '';

    this.busyIds.add(t.id);

    const nuevo = !t.activo;

    this.tourService.toggleActivo(t.id, nuevo).subscribe({
      next: () => {
        this.tours = this.tours.map(x => (x.id === t.id ? { ...x, activo: nuevo } : x));
        this.actionMsg = nuevo ? 'Tour activado ✅' : 'Tour desactivado ✅';
        this.busyIds.delete(t.id);
      },
      error: (err) => {
        console.error(err);
        this.errorGlobal = err?.error?.message || 'No se pudo cambiar el estado del tour';
        this.busyIds.delete(t.id);
      }
    });
  }

  // ======== eliminar ========
  // Nota: en tu BD te falló por FK de reservas.
  // En apps reales: NO se elimina, se desactiva.
  eliminar(t: Tour): void {
    this.errorGlobal = '';
    this.actionMsg = '';

    // Si quieres que "Eliminar" sea realmente desactivar (recomendado):
    // puedes comentar el delete real y llamar toggleActivo(false).
    // Por ahora: intentamos delete; si falla por FK -> desactivamos.
    const ok = confirm(`¿Eliminar "${t.nombre}"?\n\nSi tiene reservas, se desactivará automáticamente.`);
    if (!ok) return;

    this.busyIds.add(t.id);

    this.tourService.eliminar(t.id).subscribe({
      next: () => {
        this.tours = this.tours.filter(x => x.id !== t.id);
        this.actionMsg = 'Tour eliminado ✅';
        this.busyIds.delete(t.id);
      },
      error: (err) => {
        console.error(err);

        // Si falla por FK (tiene reservas), hacemos soft delete: desactivar
        const msg = (err?.error?.message || '').toString().toLowerCase();
        const isFk =
          msg.includes('foreign key') ||
          msg.includes('constraint') ||
          msg.includes('cannot delete') ||
          err?.status === 409 ||
          err?.status === 500;

        if (isFk) {
          this.tourService.toggleActivo(t.id, false).subscribe({
            next: () => {
              this.tours = this.tours.map(x => (x.id === t.id ? { ...x, activo: false } : x));
              this.actionMsg = 'No se puede eliminar (tiene reservas). Se desactivó ✅';
              this.busyIds.delete(t.id);
            },
            error: (e2) => {
              console.error(e2);
              this.errorGlobal =
                e2?.error?.message ||
                'No se pudo eliminar ni desactivar el tour';
              this.busyIds.delete(t.id);
            }
          });
          return;
        }

        this.errorGlobal = err?.error?.message || 'Error eliminando tour';
        this.busyIds.delete(t.id);
      }
    });
  }

  // ======== util ========
  isBusy(t: Tour): boolean {
    return this.busyIds.has(t.id) || this.saving || this.loading;
  }

  // ======== reactivar todos ========
  reactivarTodos(): void {
    this.errorGlobal = '';
    this.actionMsg = '';

    const inactivos = this.tours.filter(t => !t.activo);
    if (!inactivos.length) {
      this.actionMsg = 'No hay tours inactivos.';
      return;
    }

    const ok = confirm(`Vas a activar ${inactivos.length} tours. ¿Continuar?`);
    if (!ok) return;

    inactivos.forEach(t => {
      this.busyIds.add(t.id);
      this.tourService.toggleActivo(t.id, true).subscribe({
        next: () => {
          this.tours = this.tours.map(x => (x.id === t.id ? { ...x, activo: true } : x));
          this.busyIds.delete(t.id);
        },
        error: (err) => {
          console.error(err);
          this.busyIds.delete(t.id);
        }
      });
    });

    this.actionMsg = 'Reactivando tours... ✅';
    this.showInactive = true;
  }
}
