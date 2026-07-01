import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  private pendingRequests = 0;
  private navigationInProgress = false;
  private hideTimer?: ReturnType<typeof setTimeout>;

  readonly loading$ = this.loadingSubject
    .asObservable()
    .pipe(distinctUntilChanged());

  startNavigation(): void {
    this.navigationInProgress = true;
    this.cancelHideTimer();
    this.updateLoadingState();
  }

  endNavigation(): void {
    this.navigationInProgress = false;
    this.scheduleLoadingStateUpdate();
  }

  startRequest(): void {
    this.pendingRequests++;
    this.cancelHideTimer();
    this.updateLoadingState();
  }

  endRequest(): void {
    this.pendingRequests = Math.max(0, this.pendingRequests - 1);
    this.scheduleLoadingStateUpdate();
  }

  private scheduleLoadingStateUpdate(): void {
    this.cancelHideTimer();

    this.hideTimer = setTimeout(() => {
      this.updateLoadingState();
    }, 180);
  }

  private updateLoadingState(): void {
    const shouldShowLoader =
      this.navigationInProgress || this.pendingRequests > 0;

    this.loadingSubject.next(shouldShowLoader);
  }

  private cancelHideTimer(): void {
    if (!this.hideTimer) {
      return;
    }

    clearTimeout(this.hideTimer);
    this.hideTimer = undefined;
  }
}
