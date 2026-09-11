import {
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  ElementRef,
  ViewChild,
} from '@angular/core';
import * as L from 'leaflet';
@Component({
  standalone: true,
  selector: 'app-location-picker',
  template:
    '<div #map style="height:290px;border-radius:12px;z-index:1" aria-label="Selecciona un punto en el mapa"></div><small>Toca el mapa o arrastra el marcador. También puedes escribir las coordenadas en los campos.</small>',
})
export class LocationPickerComponent
  implements AfterViewInit, OnDestroy, OnChanges
{
  @Input() lat = 4.57;
  @Input() lng = -74.29;
  @Output() point = new EventEmitter<{ latitude: number; longitude: number }>();
  @ViewChild('map') element!: ElementRef;
  map?: L.Map;
  marker?: L.Marker;
  observer?: ResizeObserver;
  ngAfterViewInit() {
    this.map = L.map(this.element.nativeElement).setView(
      [this.lat, this.lng],
      6,
    );
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors · HOT',
    }).addTo(this.map);
    this.marker = L.marker([this.lat, this.lng], {
      draggable: true,
      icon: L.divIcon({ html: '📍', className: 'v2-pin', iconSize: [30, 30] }),
    }).addTo(this.map);
    this.map.on('click', (e) => this.select(e.latlng));
    this.marker.on('dragend', () => this.select(this.marker!.getLatLng()));
    this.observer = new ResizeObserver(() => this.map?.invalidateSize());
    this.observer.observe(this.element.nativeElement);
  }
  ngOnChanges() {
    if (
      this.map &&
      Number.isFinite(this.lat) &&
      Number.isFinite(this.lng) &&
      Math.abs(this.lat) <= 90 &&
      Math.abs(this.lng) <= 180
    ) {
      this.marker?.setLatLng([this.lat, this.lng]);
      this.map.panTo([this.lat, this.lng]);
    }
  }
  select(p: L.LatLng) {
    this.marker?.setLatLng(p);
    this.point.emit({
      latitude: Number(p.lat.toFixed(6)),
      longitude: Number(p.lng.toFixed(6)),
    });
  }
  ngOnDestroy() {
    this.observer?.disconnect();
    this.map?.remove();
  }
}
