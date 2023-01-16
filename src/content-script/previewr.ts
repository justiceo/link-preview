import { Logger } from "../logger";
import WinBox from "winbox/src/js/winbox";
import "winbox/dist/css/winbox.min.css";
import "./previewr.css";
import { sanitizeUrl } from "@braintree/sanitize-url";

// Override the #setUrl method to set name attribute on iframe.
WinBox.prototype.setUrl = function(url, onload){

  const node = this.body.firstChild;

  if(node && (node.tagName.toLowerCase() === "iframe")){

      node.src = url;
  }
  else{

      this.body.innerHTML = '<iframe name="iframer" src="' + url + '"></iframe>';
      onload && (this.body.firstChild.onload = onload);
  }

  return this;
};

// Export the dialog dom
WinBox.prototype.getDom = function(){
  return this.dom;
};

const template = document.createElement("div");
template.innerHTML = `
'<div class=wb-header>' +
'<div class=wb-control>' +
    '<span class=wb-min></span>' +
    '<span class=wb-max></span>' +
    '<span class=wb-full></span>' +
    '<span class=wb-close></span>' +
'</div>' +
'<div class=wb-drag>'+
    '<div class=wb-icon></div>' +
    '<div class=wb-title></div>' +
'</div>' +
'</div>' +

'<div class=wb-body></div>' +

'<div class=wb-n></div>' +
'<div class=wb-s></div>' +
'<div class=wb-w></div>' +
'<div class=wb-e></div>' +
'<div class=wb-nw></div>' +
'<div class=wb-ne></div>' +
'<div class=wb-se></div>' +
'<div class=wb-sw></div>'
`
// This class is responsible to loading/reloading/unloading the angular app into the UI.
export class Previewr {
  getExtensionUrl = chrome.runtime.getURL;
  logger = new Logger("previewr");
  headerIconUrlBase = "https://www.google.com/s2/favicons?domain=";
  dialog?: WinBox;
  isVisible = false;
  url?: URL;
  navStack: URL[] = [];

  /* This function inserts an Angular custom element (web component) into the DOM. */
  init() {
    if (this.inIframe()) {
      this.logger.log(
        "Not inserting previewr in iframe: ",
        window.location.href
      );
      return;
    }

    this.listenForCspError();
    this.listenForWindowMessages();
  }

  listenForCspError() {
    document.addEventListener("securitypolicyviolation", (e) => {
      if (window.name !== "iframer") {
        return;
      }
      this.logger.error("CSP error", e, e.blockedURI);
    });
  }

  listenForWindowMessages() {
    window.addEventListener(
      "message",
      (event) => {
        if (event.origin !== window.location.origin) {
          this.logger.debug(
            "Ignoring message from different origin",
            event.origin,
            event.data
          );
          return;
        }

        if (event.data.application !== "better-previews") {
          this.logger.debug(
            "Ignoring origin messsage not initiated by Better Previews"
          );
          return;
        }

        this.logger.log("#WindowMessage: ", event);
        this.handleMessage(event.data);
      },
      false
    );
  }

  async handleMessage(message) {
    // Extract the url from the message.
    let urlStr;
    if (message.action === "copy") {
      navigator.clipboard.writeText(message.data);
      return;
    } else if (message.action === "preview") {
      urlStr = message.data;
    } else if (message.action === "search") {
      urlStr = "https://google.com/search?igu=1&q=" + message.data;
    } else if (message.action === "load") {
      if (message.sourceFrame === "iframer" && this.dialog) {
        this.dialog.setTitle(message.data.title);
        this.dialog.setIcon(
          this.headerIconUrlBase + new URL(message.href!).hostname
        );
      }
    } else if (message.action === "navigate") {
      urlStr = message.href;
    } else {
      this.logger.warn("Unhandled action", message);
    }

    // Ensure it is valid.
    if (!urlStr || sanitizeUrl(urlStr) === "about:blank") {
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
    return this.previewUrl(newUrl);
  }

  async previewUrl(url: URL) {
    this.logger.log("#previewUrl: ", url);
    this.url = url;

    if (!this.dialog) {
      this.dialog = new WinBox(url.hostname, {
        icon: this.headerIconUrlBase + url.hostname,
        url: url.href,
        x: "right",
        y: "center",
        class: ["no-max", "no-full"],
        index: await this.getMaxZIndex(),
        template: template,

        onclose: () => {
          this.navStack = [];
          this.url = undefined;
          this.dialog = undefined;
        },
      });

      this.dialog.addControl({
        index: 2,
        class: "nav-away",
        image:
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2Utd2lkdGg9IjIuNSIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNOCAzSDVhMiAyIDAgMCAwLTIgMnYzbTE4IDBWNWEyIDIgMCAwIDAtMi0yaC0zbTAgMThoM2EyIDIgMCAwIDAgMi0ydi0zTTMgMTZ2M2EyIDIgMCAwIDAgMiAyaDMiLz48L3N2Zz4=",
        click: (event, winbox) => {
          this.logger.log("#onOpenInNewTab: url", this.url);
          window.open(this.url, "_blank");
        },
      });
    } else {
      this.dialog.restore();
      this.dialog.setUrl(url.href);
      this.dialog.setTitle(url.hostname);
      this.dialog.setIcon(this.headerIconUrlBase + url.hostname);
    }

    this.dialog.removeControl("nav-back");
    if (this.navStack.length > 0) {
      this.dialog.addControl({
        index: 0,
        class: "nav-back",
        image: "../assets/images/reply-arrow.png",
        click: (event, winbox) => {
          const lastUrl = this.navStack.pop();
          if (lastUrl) {
            this.previewUrl(lastUrl);
          }
        },
      });
    }
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

  getMaxZIndex () {
    return new Promise((resolve: (arg0: number) => void) => {
      const z = Math.max(
        ...Array.from(document.querySelectorAll('body *'), (el) =>
          parseFloat(window.getComputedStyle(el).zIndex)
        ).filter((zIndex) => !Number.isNaN(zIndex)),
        0
      );
      resolve(z);
    });
  };
}
