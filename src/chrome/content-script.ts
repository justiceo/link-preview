import { Floatie } from './floatie/floatie';
import { IFrameHelper } from './iframe-helper';
import { Previewr } from './previewr';

class ContentScript {
  floatie = new Floatie();
  iframeHelper = new IFrameHelper();
  previewr = new Previewr();

  constructor() {}

  start() {
    this.floatie.startListening();
    this.previewr.insertPageLoader();
    this.iframeHelper.registerListeners();

    chrome.runtime.onMessage.addListener((request, sender, callback) => {
      console.debug('Re-posting message for DOM: ', request);
      window.postMessage(request);
      callback('ok');
    });
  }

  stop() {
    this.floatie.stopListening();
  }
}

const cs = new ContentScript();
cs.start();

// There are many iframes in a window. Uncomment below to see.
// console.log("cs: initialized on window:", window.location)
