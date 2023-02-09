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
  getExtensionUrl = chrome.runtime.getURL;
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
        image:
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2Utd2lkdGg9IjIuNSIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNOCAzSDVhMiAyIDAgMCAwLTIgMnYzbTE4IDBWNWEyIDIgMCAwIDAtMi0yaC0zbTAgMThoM2EyIDIgMCAwIDAgMi0ydi0zTTMgMTZ2M2EyIDIgMCAwIDAgMiAyaDMiLz48L3N2Zz4=",
        click: (event, winbox) => {
          this.logger.log("#onOpenInNewTab: url", this.url);
          window.open(this.url, "_blank");
        },
      });

      this.dialog.addControl({
        index: 2,
        class: "open-options",
        image:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAE00lEQVR4nO2aWWhdVRSGP6xJixm01qoYW4fYwRSxILGtig8VfFD0QWlFELHUJ/tisaDUAaR1qm2ijU8OLxWHN4cHp6JWwfqirVAFFa1DakUQ1CQ114yy4D+wPDl373PPPTdytT9ccnPX2sPaZ++1/rX2geP4f+AxYBKYTn3GgS00EQYzjEg+B2gSdAJTwCgwx/3eod8rwIk0AVZr5Q9myL6XbDn/Is4BNgMLI3obNNkXM2SvS7Yu0sdC4E5gESVjCXBEk/gFuDag+7j07suQPSzZg4H2a4GfpPcj0E1JuMAZ8bv+2l7vA+amdFuA96RzQ0ZfN0v2Zur8GFqBHc7b/VGmMd6IfTqw9wBj+u0zoAc4H3gK+NV5J2ubxnIn/1lP7yxgKfCJc9Fb5TQ+LMOYs1NGtDlZL/C1ZKMa3L5PAO8Dtwb6vR34WE91Wl5sRN+/AVY53faUMV1FDEkO7Z/AqRlyG+Q56QwDjwJn1Og8BmSI9bFHTyGNBZqD6dxWxBB7Al+pg50BvYs1WFF0pZ5CGrs0hy9Tu6ImXKLzMClvMtu4UmOPR4zNhQe0IkeqbLFG4RTgh4ArrxlGJ/arwxeYPbykMT/KcNV1BcTkwK2k8bjCOZHSAiLy8xMKUvNz6K8A+oHP5VpH9L1fshgW62za4p1OiXhGK7QtotcqlzoRoPEm2y3dEJ6W/vayjJinJ2ErdFrEiL0uSD4BXCqX2Sav86SLG3sjxiyVnh34E4pM/GRgjSLwLhdZ3460G3AR+KJI3EkSL3syIRyQ3jviYRu0OFmB8x/pabXMbipCvVdoy4xGjPDGVNTGuFo13BHYorZgj2Q1SljnMRG4PSKI1+vwhdCvtvY3L3arjbHomMe8EbhXOc5BLdi05jwDiaVF9uMXamtkMi9Wqc2hAuPNcfOdgaqCHBhWWyOSedGuNkMFx5xuhCFDBQzpdAlUQwzpqGNrmUeptUhRZGt1hAwZdx7qW+AVBcB1OWhCctgtTuRF4q7NxYewDLgJeAh4DTjskjKb8wxskd+u1OF+K3KtMRhf+yuH+91UxfVWNNe7Ymy3x63Cu2r8Vk53OhgxZqVLoS365wmIb2h3rAcuLFrgm6fqyVgkE2xxFKUiw1bLAbSLLQzoSSQUxdo0jKLUQ+BaZUCINI7rSbTkHHMbJWKJJjdUA43vk0ca1ueQDnboTCRY1Cga3+NoQR4uVS8u01gj2mKlYK74jXX8LLOH5zXmpzlyl1zod8WzIsGyKNpdEdAofF24WjGklHJMAfTqrNgcrinaiZX2j2pF7o4MFsoc8xTo7ExUw1bN4WiOK41MbFYHv1XJyOa7ks2IErMza+j/XBW+EybxchWP2OluAezOpGYsdhnjB6ly5VplaEki5ovYVvC+JdDvxowidpIGDAJXOd02jZ1khIUvfrqdMfsU2Xe6bHK/dM5TIEyuFaZUpM6KR/5aYYeuFbpdEXBS8WaBxqz7WiHLmKRIN6YyZroC2OIGvy6jr/WumJBua//f7+5ekrEGyyzS2ep+p46N4l8e0O0LOIjtOWhHryrviRFZF0Z1oUv3EydF9Da6+440XpXMmHUIbSr9FLrYKQtrNFmrxKRxWDKj4k3zwsCxFP1uuhcGcIlTU7/Cge4Tq71UE0xPj4P/CP4GdM3Fkxh1C08AAAAASUVORK5CYII=",

        click: (event, winbox) => {
          if(this.url?.href === (new URL(chrome.runtime.getURL("options-page/options.html"))).href ) {
            this.navBack();
          } else {
            if(this.url){
              this.navStack.push(this.url);
            }
            this.previewUrl(
              new URL(chrome.runtime.getURL("options-page/options.html"))
            );
          }
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
