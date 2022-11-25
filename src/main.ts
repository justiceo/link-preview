import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import * as Sentry from '@sentry/angular';
import { BrowserTracing } from '@sentry/tracing';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
  initSentry();
}

function initSentry() {
  Sentry.init({
    dsn: 'https://59000502bf014222a97c0b8d3ff7495e@o526305.ingest.sentry.io/4504220162719744',
    integrations: [
      /*
       * Registers and configures the Tracing integration,
       * which automatically instruments your application to monitor its
       * performance, including custom Angular routing instrumentation
       */
      new BrowserTracing({
        routingInstrumentation: Sentry.routingInstrumentation,
      }),
    ],

    /*
     * Set tracesSampleRate to 1.0 to capture 100%
     * of transactions for performance monitoring.
     * We recommend adjusting this value in production
     */
    tracesSampleRate: 0.1,
    release: 'better-previews@22.11.25',
    environment: 'PROD',
  });
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
