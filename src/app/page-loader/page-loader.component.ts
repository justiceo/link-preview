import {
  Component,
  ElementRef,
  NgZone,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PrimeNGConfig } from 'primeng/api';
import { Logger } from 'src/shared/logging/logger';
import { LoggingService } from 'src/app/services/logging/logging.service';

@Component({
  selector: 'audate-page-loader',
  templateUrl: './page-loader.component.html',
  styleUrls: ['./page-loader.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class PageLoaderComponent {
  logger: Logger;
  url = '';
  trustedUrl: SafeResourceUrl;
  unsupportedHost = '';
  isVisible = true;
  focusClass = '';
  drawerClass = '';
  constructor(
    private primengConfig: PrimeNGConfig,
    private sanitizer: DomSanitizer,
    private ngZone: NgZone,
    elementRef: ElementRef,
    loggingService: LoggingService
  ) {
    this.logger = loggingService.getLogger('page-loader');
    this.url = elementRef.nativeElement.getAttribute('url');
    this.trustedUrl = sanitizer.bypassSecurityTrustResourceUrl(this.url);
    this.listenForCspError();
    this.listenForUrlUpdates();
  }

  listenForCspError() {
    document.addEventListener('securitypolicyviolation', (e) => {
      this.logger.error('CSP error', e, e.blockedURI);
      this.unsupportedHost = window.location.origin;
      // TODO: send a message to background script to open url, there might not be a popup running.
      setTimeout(() => {
        window.open(this.url, '_blank');
        this.isVisible = false;
      }, 1000);
    });
  }

  listenForUrlUpdates() {
    const channel = new BroadcastChannel('audate_link_preview');
    channel.onmessage = (e) => {
      this.ngZone.run(() => {
        this.logger.log('Received broadcast to preview', e.data);
        this.url = e.data;
        this.trustedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          this.url
        );
        if (this.unsupportedHost) {
          window.open(this.url, '_blank');
          return;
        }
        this.isVisible = true;
        this.focusClass = '';
        this.drawerClass = '';
      });
    };
  }

  onResizeStart(e: any) {
    this.logger.debug('onResizeStart: ', e);
  }
  onResizeEnd(e: any) {
    this.logger.debug('onResizeEnd: ', e);
  }
  onShow(e: any) {
    this.logger.debug('onShow: ', e);
  }
  onHide(e: any) {
    this.logger.debug('onHide: ', e);
  }
  onDragEnd(e: any) {
    this.logger.debug('onDragEnd: ', e);
  }
  onMaximize(e: any) {
    this.logger.debug('onMaximize: ', e);
  }
  onVisibleChange(isVisible: boolean) {
    this.isVisible = isVisible;
  }
  onMouseOver(e: MouseEvent) {
    this.logger.debug('onMouseOver: ', e);
    this.focusClass = '';
    this.drawerClass = '';
  }
  onMouseOut(e: MouseEvent) {
    this.logger.debug('onMouseOut: ', e);
    // Ignore mouseout when it's from the right corner.
    if (window.visualViewport.width - e.clientX < 100) {
      return;
    }
    this.focusClass = 'transparent';
    this.drawerClass = 'parked';
  }
}
