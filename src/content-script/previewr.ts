import {Logger} from '../logger';

// This class is responsible to loading/reloading/unloading the angular app into the UI.
export class Previewr {
  getExtensionUrl = chrome.runtime.getURL;
  logger = new Logger("previewr");

  isVisible = false;

  /* This function inserts an Angular custom element (web component) into the DOM. */
  init() {
    if (this.inIframe()) {
      console.log('Not inserting page-loader in iframe');
      return;
    }

    this.listenForCspError();
    this.listenForWindowMessages();
  }

  listenForCspError() {
    document.addEventListener('securitypolicyviolation', (e) => {
      if (window.name !== 'iframer') {
        return;
      }
      this.logger.error('CSP error', e, e.blockedURI);
    });
  }

  listenForWindowMessages() {
    window.addEventListener(
      'message',
      (event) => {
        if (event.origin !== window.location.origin) {
          this.logger.debug(
            'Ignoring message from different origin',
            event.origin,
            event.data
          );
          return;
        }

        if (event.data.application !== 'better-previews') {
          this.logger.debug(
            'Ignoring origin messsage not initiated by Better Previews'
          );
          return;
        }

        this.logger.log('#WindowMessage: ', event);        
      },
      false
    );
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
}
