import { Floatie } from './floatie/floatie';
import { IFrameHelper } from './iframe-helper';
import { Previewr } from './previewr';

class ContentScript {
  floatie = new Floatie();
  iframeHelper = new IFrameHelper();
  previewr = new Previewr();
  unsupportedHosts = ['twitter.com', 'mail.google.com'];

  constructor() {}

  start() {
    if (this.isDisabledDomain()) {
      console.warn('Better Previews is disabled on ', window.location.host);
      // TODO: Update extension icon to gray.
      return;
    }

    this.floatie.startListening();
    this.previewr.insertPageLoader();
    this.iframeHelper.registerListeners();

    chrome.runtime.onMessage.addListener((request, sender, callback) => {
      console.debug('Re-posting message for DOM: ', request);
      window.postMessage({ application: 'better-previews', ...request });
      callback('ok');
    });
  }

  stop() {
    this.floatie.stopListening();
  }

  isDisabledDomain() {
    return this.unsupportedHosts.indexOf(window.location.host) >= 0;
  }
}

const cs = new ContentScript();
cs.start();

// There are many iframes in a window. Uncomment below to see.
// console.log("cs: initialized on window:", window.location)
