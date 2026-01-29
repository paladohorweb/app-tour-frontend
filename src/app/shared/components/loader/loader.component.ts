import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-loader',
  template: `<div class="loader"></div>`,
  styles: [`
    .loader {
      width:40px;
      height:40px;
      border:4px solid #ccc;
      border-top:4px solid #000;
      border-radius:50%;
      animation:spin 1s linear infinite;
    }
    @keyframes spin { to { transform:rotate(360deg) } }
  `]
})
export class LoaderComponent {}
