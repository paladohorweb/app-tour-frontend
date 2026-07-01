import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet
} from '@angular/router';
import { filter, Subscription } from 'rxjs';

import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import {
  LoaderComponent,
  LoaderContext
} from './shared/components/loader/loader.component';
import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    LoaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  isLoading = false;
  loaderContext: LoaderContext = 'default';

  private readonly subscriptions = new Subscription();

  constructor(
    private readonly router: Router,
    private readonly loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.listenToLoaderState();
    this.listenToRouterEvents();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private listenToLoaderState(): void {
    this.subscriptions.add(
      this.loadingService.loading$.subscribe((isLoading) => {
        this.isLoading = isLoading;
      })
    );
  }

  private listenToRouterEvents(): void {
    this.subscriptions.add(
      this.router.events
        .pipe(
          filter(
            (
              event
            ): event is
              | NavigationStart
              | NavigationEnd
              | NavigationCancel
              | NavigationError =>
              event instanceof NavigationStart ||
              event instanceof NavigationEnd ||
              event instanceof NavigationCancel ||
              event instanceof NavigationError
          )
        )
        .subscribe((event) => {
          if (event instanceof NavigationStart) {
            this.loaderContext = this.getLoaderContext(event.url);
            this.loadingService.startNavigation();
            return;
          }

          this.loadingService.endNavigation();
        })
    );
  }

  private getLoaderContext(url: string): LoaderContext {
    if (url.startsWith('/admin')) {
      return 'admin';
    }

    if (url.startsWith('/guia')) {
      return 'guide';
    }

    if (
      url.startsWith('/mis-reservas') ||
      url.startsWith('/checkout') ||
      url.startsWith('/pago') ||
      url.startsWith('/order')
    ) {
      return 'traveler';
    }

    return 'default';
  }
}
