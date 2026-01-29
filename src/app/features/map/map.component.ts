import { Component, Input, AfterViewInit } from "@angular/core";
import mapboxgl from 'mapbox-gl';


@Component({
  standalone: true,
  template: `<div id="map" style="height:400px"></div>`
})
export class MapComponent implements AfterViewInit {

  @Input() lat!: number;
  @Input() lng!: number;
  API: any;

  ngAfterViewInit() {
    mapboxgl.accessToken = this.API.AUHT;

    new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.lng, this.lat],
      zoom: 12
    });
  }
}
