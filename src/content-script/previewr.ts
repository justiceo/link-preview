import { Logger } from "../logger";
import WinBox from "./winbox";
import "./previewr.css";
import { sanitizeUrl } from "@braintree/sanitize-url";
import { Readability } from "@mozilla/readability";
import replyIconPng from '../assets/images/reply-arrow.png';

const iframeName = "betterpreviews.com/mainframe"; 
// Override the #setUrl method to set name attribute on iframe.
WinBox.prototype.setUrl = function (url, onload) {
  const node = this.body.firstChild;

  if (node && node.tagName.toLowerCase() === "iframe") {
    node.src = url;
  } else {
    this.body.innerHTML = '<iframe name="' + iframeName + '" src="' + url + '"></iframe>';
    onload && (this.body.firstChild.onload = onload);
  }

  return this;
};

// Export the dialog dom
WinBox.prototype.getDom = function () {
  return this.dom;
};

const template = document.createElement("div");
template.innerHTML = `
<div class=wb-header>
<div class=wb-control>
    <span class=wb-min></span>
    <span class=wb-max></span>
    <span class=wb-full></span>
    <span class=wb-close></span>
</div>
<div class=wb-drag>
    <div class=wb-icon></div>
    <div class=wb-title></div>
</div>
</div>

<div class=wb-body></div>

<div class=wb-n></div>
<div class=wb-s></div>
<div class=wb-w></div>
<div class=wb-e></div>
<div class=wb-nw></div>
<div class=wb-ne></div>
<div class=wb-se></div>
<div class=wb-sw></div>
`;
// This class is responsible to loading/reloading/unloading the angular app into the UI.
export class Previewr {
  logger = new Logger("previewr");
  headerIconUrlBase = "https://www.google.com/s2/favicons?domain=";
  dialog?: WinBox;
  isVisible = false;
  url?: URL;
  navStack: URL[] = [];
  displayReaderMode = false;

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
      if (window.name !== iframeName) {
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
      if (message.sourceFrame === iframeName && this.dialog) {
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
    this.logger.log("#previewUrl fake: ", url);
    this.url = url;

    const winboxOptions = {
      icon: this.headerIconUrlBase + url.hostname,
      x: "right",
      y: "50px",
      right: 10,
      width: "55%",
      height: "80%",
      class: ["no-max", "no-full"],
      index: await this.getMaxZIndex(),

      onclose: () => {
        this.navStack = [];
        this.url = undefined;
        this.dialog = undefined;
      },
    };

    if (this.displayReaderMode) {
      let reader = new Readability(window.document.cloneNode(true) as Document);
      let article = reader.parse();
      if (!article) {
        console.error("Article is null");
        winboxOptions.html = `<h1>Failed to parse article</h1>`;
      }
      winboxOptions.html = `<h1>${article.title}</h1> <p>${article.byline}</p> ${article.content}`;
    } else {
      winboxOptions.url = this.url;
    }

    if (!this.dialog) {
      this.logger.debug("creating new dialog");
      this.dialog = new WinBox(url.hostname, winboxOptions);

      this.dialog.addControl({
        index: 2,
        class: "nav-away",
        title: "Open in New Tab",
        image:
        "data:image/png;base64,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",
        click: (event, winbox) => {
          this.logger.log("#onOpenInNewTab: url", this.url);
          window.open(this.url, "_blank");
        },
      });

    } else {
      this.logger.debug("restoring dialog");
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
        image: replyIconPng,
        title: "Go Back",
        click: (event, winbox) => {
          this.navBack();
        },
      });
    }
  }

  navBack() {
    const lastUrl = this.navStack.pop();
    if (lastUrl) {
      this.previewUrl(lastUrl);
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

  getMaxZIndex() {
    return new Promise((resolve: (arg0: number) => void) => {
      const z = Math.max(
        ...Array.from(document.querySelectorAll("body *"), (el) =>
          parseFloat(window.getComputedStyle(el).zIndex)
        ).filter((zIndex) => !Number.isNaN(zIndex)),
        0
      );
      resolve(z);
    });
  }
}
