import {
  ApplicationRef,
  DoBootstrap,
  ErrorHandler,
  Injector,
  NgModule,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { createCustomElement } from '@angular/elements';
import { APP_BASE_HREF } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { PreviewModule } from './preview/preview.module';
import { CardModule } from 'primeng/card';
import { CarouselModule } from 'primeng/carousel';
import * as Sentry from '@sentry/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OptionsPageComponent } from './options-page/options-page.component';
import { Router } from '@angular/router';
import { PageLoaderComponent } from './page-loader/page-loader.component';

@NgModule({
  declarations: [AppComponent, OptionsPageComponent, PageLoaderComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ButtonModule,
    CardModule,
    CarouselModule,
    DropdownModule,
    PreviewModule,
    AppRoutingModule,
    FormsModule,
  ],
  providers: [
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: true,
      }),
    },
    {
      provide: Sentry.TraceService,
      deps: [Router],
    },
    {
      provide: APP_BASE_HREF,
      useValue: '/',
    },
  ],
})
export class AppModule implements DoBootstrap {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(private injector: Injector, trace: Sentry.TraceService) { }
  ngDoBootstrap(appRef: ApplicationRef) {
    if (document.querySelector('sp-root')) {
      appRef.bootstrap(AppComponent);
    }

    const el = createCustomElement(PageLoaderComponent, {
      injector: this.injector,
    });
    customElements.define('sp-page-loader', el);
  }
}
