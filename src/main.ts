import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import * as Sentry from '@sentry/angular';
import { BrowserTracing } from '@sentry/tracing';

import { AppModule } from './app/components/audate-root/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

Sentry.init({
  dsn: 'https://e3cc3436f33741a996dbfdd7f2f3ed59@o526305.ingest.sentry.io/6371071',
  integrations: [
    /*
     * Registers and configures the Tracing integration,
     * which automatically instruments your application to monitor its
     * performance, including custom Angular routing instrumentation
     */
    new BrowserTracing({
      tracingOrigins: ['localhost', 'https://yourserver.io/api'],
      routingInstrumentation: Sentry.routingInstrumentation,
    }),
  ],

  /*
   * Set tracesSampleRate to 1.0 to capture 100%
   * of transactions for performance monitoring.
   * We recommend adjusting this value in production
   */
  tracesSampleRate: 1.0,
});

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
