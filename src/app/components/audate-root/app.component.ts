import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';
import { Logger } from 'src/shared/logging/logger';
import { LoggingService } from 'src/app/services/logging/logging.service';

@Component({
  selector: 'audate-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  logger: Logger;

  constructor(
    private router: Router,
    private primengConfig: PrimeNGConfig,
    loggingService: LoggingService
  ) {
    this.logger = loggingService.getLogger('audate-root');
  }

  ngOnInit() {
    this.primengConfig.ripple = true;
    this.addExtensionRedirects();
  }

  /**
   * Enables navigating to different pages in chrome extension
   * where paths are not supported but fragments are.
   * This function would redirect index.html/#popup
   * (or simply /#popup) to the path /popup.
   */
  addExtensionRedirects() {
    const fragment = window.location.href.split('#')[1];
    const matchingRoute = this.router.config
      .map((r) => r.path)
      .find((p) => p === fragment);

    if (matchingRoute) {
      this.router.navigateByUrl(fragment, { skipLocationChange: true });
    } else {
      this.logger.error('Invalid fragment ', fragment);
    }
  }
}
