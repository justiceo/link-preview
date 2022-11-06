import { ContextMenu } from './context-menu';
import { Floatie } from './floatie/floatie';
import { IFrameHelper } from './iframe-helper';
import { Previewr } from './previewr';

class ContentScript {
  floatie = new Floatie();
  floatieChannel: BroadcastChannel;
  cMenu = new ContextMenu();
  iframeHelper = new IFrameHelper();
  previewr = new Previewr();

  constructor() {
    this.floatieChannel = new BroadcastChannel(this.floatie.getChannelName());
    this.floatieChannel.onmessage = (ev) => {
      console.log(`Action result: ${ev.data.action} "${ev.data.data}"`);
    };
  }

  start() {
    this.floatie.startListening();
    this.previewr.insertPageLoader();
    this.cMenu.init();
    this.iframeHelper.registerListeners();

    chrome.runtime.onMessage.addListener(
      (request, sender, sendResponse) => {
        console.log("cs: received", request, 'from', sender);
        this.floatieChannel.postMessage(request);
        sendResponse("ok");
      }
    );
  }

  stop() {
    this.floatie.stopListening();
  }
}

const cs = new ContentScript();
cs.start();
console.log("initialized cs on window:", window.location, "for document:", document.location)