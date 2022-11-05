import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
  headerIconUrlBase = "http://www.google.com/s2/favicons?domain=";
  headerIconUrl: string = "";
  @ViewChild("iframe") iframe!: ElementRef;

  constructor(
    private sanitizer: DomSanitizer,
    private ngZone: NgZone,
  ) {}

  ngAfterViewInit() {
    this.isVisible = false; // Hide the tiny dialog that was shown during init.
    this.listenForCspError();
    this.listenForUrlUpdates();
    setTimeout(() => {
      const channel = new BroadcastChannel('floatie_broadcast');
      channel.postMessage({ action: 'preview', data: 'https://example.com' });
    }, 2000)
  }

  listenForCspError() {
    document.addEventListener('securitypolicyviolation', (e) => {
      console.error('CSP error', e, e.blockedURI);
      this.unsupportedHost = window.location.origin;
      // TODO: send a message to background script to open url, there might not be a popup running.
      setTimeout(() => {
        window.open(this.url, '_blank');
        this.isVisible = false;
      }, 1000);
    });
  }

  listenForUrlUpdates() {
    const channel = new BroadcastChannel('floatie_broadcast');
    channel.onmessage = (e) => {
      this.ngZone.run(() => {
        if (e.data.action !== 'preview') {
          return;
        }
        console.log('Received broadcast to preview', e.data.data);
        try {
          this.url = new URL(e.data.data);
        } catch (e) {
          console.error(e);
          return;
        }
        this.trustedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          this.url.href
        );
        if (this.unsupportedHost) {
          window.open(this.url, '_blank');
          return;
        }

        this.headerText = this.url.hostname;
        this.headerIconUrl = this.headerIconUrlBase + this.url.hostname;
        this.width = '50vw';
        this.height = '70vh';
        this.isVisible = true;
        this.focusClass = '';
        this.drawerClass = '';
      });
    };
  }

  onResizeStart(e: any) {
    console.debug('onResizeStart: ', e);
  }
  onResizeEnd(e: any) {
    console.debug('onResizeEnd: ', e);
  }
  onShow(e: any) {
    console.debug('onShow: ', e);
  }
  onHide(e: any) {
    console.debug('onHide: ', e);
  }
  onDragEnd(e: any) {
    console.debug('onDragEnd: ', e);
  }
  onOpenInNewTab(e: any) {
    /*
     * This is susceptible to cross original issues.
     * Use message-passing as a work-around.
     */
    try {
      const currentFrameUrl = this.iframe.nativeElement.contentWindow?.location?.href;
      window.open(currentFrameUrl, '_blank');
    } catch (e) {
      console.warn(e);
      window.open(this.url, '_blank');
    }
  }
  onVisibleChange(isVisible: boolean) {
    this.isVisible = isVisible;
  }
  onMouseOver(e: MouseEvent) {
    console.debug('onMouseOver: ', e);
    this.focusClass = '';
    this.drawerClass = '';
  }
  onMouseOut(e: MouseEvent) {
    console.debug('onMouseOut: ', e);
    // Ignore mouseout when it's from the right corner.
    if (window.visualViewport.width - e.clientX < 100) {
      return;
    }
    /*
     * TODO: Disable hiding the panel for easier development.
     * this.focusClass = 'transparent';
     * this.drawerClass = 'parked';
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