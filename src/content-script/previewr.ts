import {Logger} from '../logger';
import WinBox from "winbox/src/js/winbox";
import "winbox/dist/css/winbox.min.css";
import {sanitizeUrl} from '@braintree/sanitize-url';

// This class is responsible to loading/reloading/unloading the angular app into the UI.
export class Previewr {
  getExtensionUrl = chrome.runtime.getURL;
  logger = new Logger("previewr");
  headerIconUrlBase = 'https://www.google.com/s2/favicons?domain=';
  dialog?: WinBox;
  isVisible = false;
  url: URL;
  navStack: URL[] = [];

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
        this.handleMessage(event.data);       
      },
      false
    );
  }

  handleMessage(message) {
    // Extract the url from the message.
    let urlStr;
    if (message.action === 'copy') {
      navigator.clipboard.writeText(message.data);
      return;
    } else if (message.action === 'preview') {
      urlStr = message.data;
    } else if (message.action === 'search') {
      urlStr = 'https://google.com/search?igu=1&q=' + message.data;
    } else if (message.action === 'load') {
      if (message.sourceFrame === 'iframer') {
        this.dialog.title = "header update";
      }
    } else if (message.action === 'navigate') {
      urlStr = message.href;
    } else {
      this.logger.warn('Unhandled action', message);
    }

    // Ensure it is valid.
    if (!urlStr || sanitizeUrl(urlStr) === 'about:blank') {
      return;
    }
    let newUrl;
    try {
      newUrl = new URL(urlStr);
    } catch (e) {
      this.logger.error(e);
      return;
    }

    // Move the old URL to backstack.
    if (this.url && this.url.href !== newUrl.href) {
      this.navStack.push(this.url);
    }

    // Preview new URL.
    this.url = newUrl;
    this.previewUrl(this.url);
  }

  previewUrl(url: URL) {
    this.logger.log("#previewUrl: ", url);
   
    this.dialog = new WinBox(url.hostname, {
      icon: this.headerIconUrlBase + url.hostname,
      url: url.href,
      border: 2,
    });
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
