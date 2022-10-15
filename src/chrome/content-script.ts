import { Floatie } from './floatie/floatie';
import { LoggingService } from './logging-service';

class ContentScript {
  floatie: Floatie;
  floatieChannel: BroadcastChannel;
  getExtensionUrl = chrome.runtime.getURL;
  logger = new LoggingService().getLogger('content-script');

  constructor() {
    this.floatie = new Floatie();
    this.floatieChannel = new BroadcastChannel(this.floatie.getChannelName());
    this.floatieChannel.onmessage = (ev) => {
        console.log( `Action result: ${ev.data.action} "${ev.data.data}"`);
    };
  }

  start() {
    this.floatie.startListening();
  }

  stop() {
    this.floatie.stopListening();
  }

  /* This function inserts an Angular custom element (web component) into the DOM. */
  insertPageLoader(url: string) {
    if (this.inIframe()) {
      return;
    }

    const stylesheets = `
    <link href="${this.getExtensionUrl('content-style.css')}" rel="stylesheet">
  `;
    const styleRange = document.createRange();
    styleRange.selectNode(document.getElementsByTagName('body').item(0)!);
    const styleFragment = styleRange.createContextualFragment(stylesheets);
    document.body.appendChild(styleFragment);

    const tagString = `
    <sp-page-loader url="${url}"></sp-page-loader>
    <script src="${this.getExtensionUrl('runtime.js')}"></script>
    <script src="${this.getExtensionUrl('polyfills.js')}"></script>
    <script src="${this.getExtensionUrl('vendor.js')}"></script>
    <script src="${this.getExtensionUrl('main.js')}"></script>
  
   `;
    const range = document.createRange();
    range.selectNode(document.getElementsByTagName('body').item(0)!);
    const documentFragment = range.createContextualFragment(tagString);
    const audateWrapper = document.createElement('div');
    audateWrapper.id = 'audate-preview-container';
    const shadow = audateWrapper.attachShadow({ mode: 'open' });
    shadow.appendChild(documentFragment);
    document.body.appendChild(audateWrapper);
  }

  /*
   * Returns true if this script is running inside an iframe,
   * since the content script is added to all frames.
   */
  inIframe() {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }


  redirectLinks() {
    // If the <a> element contains other elements, we traverse the tree to find the anchor element clicked:
    document.body.addEventListener(
      'click',
      (e) => {
        var targetEl: any = this.getLinkTarget(e);
        if (targetEl) {
          // TODO: Publish this event to the containing document, which can reset the iframe src.
          this.logger.log('Click on link detected inside iframe', targetEl);
          targetEl.target = '_parent';
        }
      },
      true
    );
  }

  displayPreview(url: string) {
    if (document.getElementById('audate-preview-container')) {
      this.logger.debug('broadcasting the url');
      this.channel.postMessage(url);
    } else {
      this.logger.debug('inserting audate preview');
      this.insertPageLoader(url);
    }
  }

  // Returns a truthy value (the link element) if event target is a link.
  getLinkTarget(e: MouseEvent | KeyboardEvent): EventTarget | null {
    var target: any = e.target;
    do {
      if (target.nodeName.toUpperCase() === 'A' && target.href) {
        return target;
      }
    } while ((target = target.parentElement));
    return null;
  }
}
new ContentScript();
