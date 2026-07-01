import {
  Component,
  Input
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type LoaderContext =
  | 'default'
  | 'admin'
  | 'guide'
  | 'traveler';

interface LoaderContent {
  icon: string;
  label: string;
  title: string;
  message: string;
}

@Component({
  standalone: true,
  selector: 'app-loader',
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent {
  @Input() context: LoaderContext = 'default';

  private readonly contentByContext: Record<
    LoaderContext,
    LoaderContent
  > = {
    default: {
      icon: '✦',
      label: 'TurismoApp',
      title: 'Preparando tu experiencia',
      message: 'Estamos organizando todo para ti.'
    },

    admin: {
      icon: '⚙️',
      label: 'Panel administrativo',
      title: 'Cargando operación turística',
      message: 'Estamos preparando tours, reservas y métricas.'
    },

    guide: {
      icon: '🧭',
      label: 'Panel de guía',
      title: 'Preparando tus experiencias',
      message: 'Estamos organizando los recorridos asignados.'
    },

    traveler: {
      icon: '🧳',
      label: 'Área del viajero',
      title: 'Preparando tu viaje',
      message: 'Estamos consultando la información de tu reserva.'
    }
  };

  get content(): LoaderContent {
    return this.contentByContext[this.context];
  }
}
