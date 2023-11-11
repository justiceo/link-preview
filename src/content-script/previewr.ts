import { Logger } from "../utils/logger";
import { WinBox } from "../utils/winbox/winbox";
import "./previewr.css";
import { sanitizeUrl } from "@braintree/sanitize-url";
import { Readability } from "@mozilla/readability";
import "../utils/feedback/feedback";
import { FeedbackData } from "../background-script/feedback-checker";
import { FEEDBACK_DATA_KEY } from "../utils/storage";
import Storage from "../utils/storage";
import Analytics from "../utils/analytics";
import manifest from "../manifest.json";

const iframeName = manifest.__package_name__ + "/mainframe";
// Override the #setUrl method to set name attribute on iframe.
WinBox.prototype.setUrl = function (url, onload) {
  const node = this.body.firstChild;

  if (node && node.tagName.toLowerCase() === "iframe") {
    node.src = url;
  } else {
    this.body.innerHTML =
      '<iframe name="' + iframeName + '" src="' + url + '"></iframe>';
    onload && (this.body.firstChild.onload = onload);
  }

  return this;
};

// This class is responsible to loading/reloading/unloading the angular app into the UI.
export class Previewr {
  logger = new Logger(this);
  headerIconUrlBase = "https://www.google.com/s2/favicons?domain=";
  dialog?: WinBox;
  isVisible = false;
  url?: URL;
  navStack: URL[] = [];
  displayReaderMode = false;
  isDemo = false;

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
    document.addEventListener("keydown", this.onEscHandler);
  }

  listenForCspError() {
    document.addEventListener("securitypolicyviolation", (e) => {
      if (window.name !== iframeName) {
        return;
      }
      this.logger.error("CSP error", e, e.blockedURI);
    });
  }

  onEscHandler = (evt) => {
    evt = evt || window.event;
    var isEscape = false;
    if ("key" in evt) {
      isEscape = evt.key === "Escape" || evt.key === "Esc";
    } else {
      isEscape = evt.keyCode === 27;
    }
    if (isEscape) {
      this.handleMessage({
        action: "escape",
        href: document.location.href,
        sourceFrame: iframeName,
      });
    }
  };

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
    if (message.mode === "demo") {
      this.isDemo = true;
    }

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
    } else if (message.action === "escape") {
      this.dialog?.close();
      return;
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

    const winboxOptions = {
      icon: this.headerIconUrlBase + url.hostname,
      x: "right",
      y: this.isDemo ? "500px" : "50px",
      right: 10,
      width: this.isDemo ? "45%" : "55%",
      height: this.isDemo ? "40%" : "80%",
      class: ["no-max", "no-full"],
      index: await this.getMaxZIndex(),
      hidden: false,
      shadowel: "search-preview-window",
      framename: iframeName,

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
        class: "wb-nav-away",
        title: "Open in New Tab",
        image: "",
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
        image: "",
        title: "Go Back",
        click: (event, winbox) => {
          this.navBack();
        },
      });
    }

    await this.registerFeedbackUI();
  }

  async registerFeedbackUI() {
    const feedbackData: FeedbackData | null = await Storage.get(
      FEEDBACK_DATA_KEY
    );
    const shouldShow = feedbackData?.status === "eligible";
    if (shouldShow) {
      this.dialog?.addClass("show-footer");
    }

    // Listen for component events.
    const ff = this.dialog?.dom.querySelector("feedback-form");
    ff.setProgressHandler((status, data) => {
      if (status === "started") {
        this.logger.log("started: this", this, chrome?.storage?.sync);
        const feedbackUpdate: FeedbackData = {
          status: "honored",
          timestamp: Date.now(),
          rating: data,
        };
        Storage.put(FEEDBACK_DATA_KEY, feedbackUpdate);

        Analytics.fireEvent("user_feedback", {
          action: "rate_experience",
          star_rating: data,
        });
      }

      if (status === "completed") {
        this.dialog?.removeClass("show-footer");
        Analytics.fireEvent("user_feedback", {
          action: "submit_feedback",
          feedback_text: data,
        });
      }
    });
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
new Previewr().init();
