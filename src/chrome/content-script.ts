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

    window.addEventListener('message', (e) => {
      if(e.data.sourceFrame !== 'iframer') {
        console.log("Ignoring message not from iframer");
        return;
      }
      console.log("cs: broadcasting window message: ", e.data, 'from: ', window.location.href);
      this.floatieChannel.postMessage(e.data);
    }, true);

    // Or.

    var port = chrome.runtime.connect({ name: this.iframeHelper.getChannelName() });
    port.onMessage.addListener((m) => {
      console.log("cs: broadcasting extension message: ", m, 'from: ', window.location.href);
      this.floatieChannel.postMessage(m);
    })
  }

  stop() {
    this.floatie.stopListening();
  }
}

const cs = new ContentScript();
cs.start();