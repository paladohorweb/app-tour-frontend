import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { Lugar } from "../../core/models/tour";
import { LugarService } from "../../core/services/tour.service";

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule],
  template: `
    <h2>Lugares Turísticos</h2>

    <div class="grid">
      <div *ngFor="let lugar of lugares" class="card">
        <img [src]="lugar.imagenUrl">
        <h3>{{ lugar.nombre }}</h3>
        <p>{{ lugar.ciudad }}, {{ lugar.pais }}</p>
      </div>
    </div>
  `
})
export class HomeComponent {

  lugares: Lugar[] = [];

  constructor(private lugarService: LugarService) {}

  ngOnInit() {
    this.lugarService.listar().subscribe(data => this.lugares = data);
  }
}
