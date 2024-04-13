import { Logger } from "../utils/logger";
import { WinBox } from "../utils/winbox/winbox";
import "../utils/feedback/feedback";
import { FeedbackData } from "../background-script/feedback-checker";
import { FEEDBACK_DATA_KEY } from "../utils/storage";
import Storage from "../utils/storage";
import Analytics from "../utils/analytics";
import manifest from "../manifest.json";

export class WinboxRenderer {
  logger = new Logger(this);
  headerIconUrlBase = "https://www.google.com/s2/favicons?domain=";
  iframename = manifest.__package_name__ + "/mainframe";
  dialog?: WinBox;
  isVisible = false;
  url?: URL;
  navStack: URL[] = [];
  searchUrl = {
    google: "https://www.google.com/search?igu=1&q=",
    bing: "https://www.bing.com/search?q=",
    yahoo: "https://search.yahoo.com/search?p=",
    baidu: "https://www.baidu.com/s?wd=",
    yandex: "https://yandex.com/search/?text=",
    duckduckgo: "https://duckduckgo.com/?q=",
    ecosia: "https://www.ecosia.org/search?q=",
  };

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
      Analytics.fireEvent("preview_action");
      urlStr = message.data;
    } else if (message.action === "search") {
      Analytics.fireEvent("search_action");
      const searchEngine = (await Storage.get("search-engine")) ?? "google";
      urlStr = this.searchUrl[searchEngine] + message.data;
    } else if (message.action === "load") {
      if (message.sourceFrame === iframeName && this.dialog) {
        this.dialog.setTitle(message.data.title);
        this.dialog.setIcon(
          this.headerIconUrlBase + new URL(message.href!).hostname,
        );
      }
    } else if (message.action === "navigate") {
      Analytics.fireEvent("navigate_action");
      urlStr = message.href;
    } else if (message.action === "escape") {
      Analytics.fireEvent("escape_action");
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

    const winboxOptions = await this.getWinboxOptions(url);

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
    const feedbackData: FeedbackData | null =
      await Storage.get(FEEDBACK_DATA_KEY);
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

  getMaxZIndex() {
    return new Promise((resolve: (arg0: number) => void) => {
      const z = Math.max(
        ...Array.from(document.querySelectorAll("body *"), (el) =>
          parseFloat(window.getComputedStyle(el).zIndex),
        ).filter((zIndex) => !Number.isNaN(zIndex)),
        0,
      );
      resolve(z);
    });
  }

  async getWinboxOptions(url: URL, point?: DOMRect) {
    // Set width and height from options if present.
    let width = ((await Storage.get("previewr-width")) ?? "55") + "%";
    let height = ((await Storage.get("previewr-height")) ?? "80") + "%";

    // Leave space on top for headers/navigation.
    let top = "50px";

    // In demo mode, use small width and height, and push down previewr.
    if (this.isDemo) {
      width = "45%";
      height = "40%";
      top = "500px";
    }
    return {
      icon: this.headerIconUrlBase + url.hostname,
      x: "right",
      y: top,
      right: 10,
      width: width,
      height: height,
      class: ["no-max", "no-full"],
      index: await this.getMaxZIndex(),
      hidden: false,
      shadowel: "search-preview-window",
      framename: this.iframeName,
      url: url,

      onclose: () => {
        this.navStack = [];
        this.url = undefined;
        this.dialog = undefined;
      },
    };
  }
}
