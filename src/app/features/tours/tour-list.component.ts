import { Component, OnInit } from "@angular/core";
import { Tour } from "../../core/models/tour.model";
import { TourService } from "../../core/services/tour.service";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";

@Component({
  standalone: true,
  imports: [CommonModule,RouterLink],
  selector: "app-tour-list",
  templateUrl: "./tour-list.component.html",
  styleUrls: ["./tour-list.component.css"]
})
export class TourListComponent implements OnInit {

  tours: Tour[] = [];

  constructor(private service: TourService) {}

  ngOnInit(): void {
    this.service.listar().subscribe((r: Tour[]) => {
      this.tours = r;
    });
  }
}
