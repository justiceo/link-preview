import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Logger } from '../services/logging/logger';
import { LoggingService } from '../services/logging/logging.service';

@Component({
  selector: 'sp-iframer',
  templateUrl: './iframer.component.html',
  styleUrls: ['./iframer.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class IFramerComponent implements AfterViewInit {
  url?: URL;
  trustedUrl?: SafeResourceUrl;
  unsupportedHost = '';
  isVisible = true; // It is important that the dialog is visible at the start, even if no iframe. (width/heigh = 0px)
  focusClass = '';
  drawerClass = '';
  width = '0px';
  height = '0px';
  headerText: string = "";
  headerIconUrlBase = "https://www.google.com/s2/favicons?domain=";
  headerIconUrl: string = "";
  @ViewChild("iframe") iframe!: ElementRef<HTMLIFrameElement>;
  logger: Logger;

  constructor(
    private sanitizer: DomSanitizer,
    private ngZone: NgZone,
    loggingService: LoggingService,
  ) {
    this.logger = loggingService.getLogger('sp-iframer');
  }

  ngAfterViewInit() {
    this.isVisible = false; // Hide the tiny dialog that was shown during init.
    this.listenForCspError();
    this.listenForBroadcasts();
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

  listenForBroadcasts() {
    const channel = new BroadcastChannel('floatie_broadcast');
    channel.onmessage = (e) => {
      this.logger.log('#onmessage:', e.data);
      this.ngZone.run(() => {
        let url;
        if (e.data.action === 'preview') {
          url = e.data.data;
        } else if (e.data.action === 'search') {
          url = 'https://google.com/search?igu=1&q=' + e.data.data;
        } else if (e.data.action === 'load') {
          this.headerText = new URL(e.data.href).hostname;
          this.headerIconUrl = this.headerIconUrlBase + this.headerText;
        } else if (e.data.action === 'navigate') {
          url = e.data.href;
        } else {
          this.logger.warn("Unhandled action", e.data);
        }
        if (url) {
          this.previewUrl(url);
        }
      });
    };
  }

  previewUrl(url: string) {
    try {
      this.url = new URL(url);
    } catch (e) {
      this.logger.error(e);
      return;
    }
    this.trustedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.url.href
    );
    if (this.unsupportedHost) {
      this.logger.warn("Unsupported host: ", this.unsupportedHost);
      // TODO: Display button to open in new tab.
      return;
    }

    this.headerText = this.url.hostname;
    this.headerIconUrl = this.headerIconUrlBase + this.url.hostname;
    this.width = '50vw';
    this.height = '70vh';
    this.isVisible = true;
    this.focusClass = '';
    this.drawerClass = '';
  }

  onResizeStart(e: any) {
    this.logger.debug('#onResizeStart: ', e);
  }
  onResizeEnd(e: any) {
    this.logger.debug('#onResizeEnd: ', e);
  }
  onShow(e: any) {
    this.logger.debug('#onShow: ', e);
  }
  onHide(e: any) {
    this.logger.debug('#onHide: ', e);
  }
  onDragEnd(e: any) {
    this.logger.debug('#onDragEnd: ', e);
  }
  onOpenInNewTab() {
    this.logger.log('#onOpenInNewTab: url', this.url);
    window.open(this.url, '_blank');
  }
  onVisibleChange(isVisible: boolean) {
    this.isVisible = isVisible;
  }
  onMouseOver(unused: MouseEvent) {
    this.focusClass = '';
    this.drawerClass = '';
  }
  onMouseOut(e: MouseEvent) {
    // Ignore mouseout when it's from the right corner.
    const viewportWidth = window?.visualViewport?.width ?? 0;
    if (viewportWidth - e.clientX < 100) {
      return;
    }
    /*
     * TODO: Disable hiding the panel for easier development.
     * this.focusClass = 'transparent';
     * this.drawerClass = 'parked';
     */
  }

  onLoaded(e: any) {
    this.logger.debug("#onLoaded", e);
    /*
     * While this does not tell us which URL is loaded,
     * It can be used to:
     * 1. Measure time taken to load the page.
     * 2. End any running 'loading' animation.
     * 3. Inform that "Open in New Tab" button may not open the expected URL.
     * 4. Display a backward navigation button.
     */
  }

  /*
   *- Information you'd like to show (remember, even chrome couldn't fit all of them in)
   *- Window controls: Close, Maximize, Pull-aside (style by OS?) Remember windows vs mac is 74:14
   *- Tab actions: Copy-page address, Reload page, Navigate forward/back
   *- Tab data: Page favicon, Page title, hostname
   *- Checkout opera for inspiration.
   */
}