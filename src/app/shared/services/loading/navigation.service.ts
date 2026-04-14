import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { LoadingService } from './loading.service';

@Injectable({ providedIn: 'root' })
export class NavigationLoadingService {
  #router = inject(Router);
  #loadingService = inject(LoadingService);
  #platformId = inject(PLATFORM_ID);

  constructor() {
    if (!isPlatformBrowser(this.#platformId)) return;

    this.#router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.#loadingService.show();
      }
      if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        this.#loadingService.hide();
      }
    });
  }
}
