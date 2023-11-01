import { Floatie } from "./floatie/floatie";
import { IFrameHelper } from "./iframe-helper";
import { Previewr } from "./previewr";
import * as Sentry from "@sentry/browser";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: "https://59000502bf014222a97c0b8d3ff7495e@o526305.ingest.sentry.io/4504220162719744",

  integrations: [new BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.1,
  release: "better-previews@23.01.13",
  environment: "PROD",
});

class ContentScript {
  floatie = new Floatie();
  iframeHelper = new IFrameHelper();
  previewr = new Previewr();
  unsupportedHosts = ["mail.google.com"];

  constructor() {}

  start() {
    if (this.isDisabledDomain()) {
      console.warn("Better Previews is disabled on ", window.location.host);
      // TODO: Update extension icon to gray.
      return;
    }

    this.floatie.startListening();
    this.previewr.init();
    this.iframeHelper.registerListeners();

    chrome.runtime.onMessage.addListener((request, sender, callback) => {
      console.debug("Re-posting message for DOM: ", request);
      window.postMessage({ application: "better-previews", ...request });
      callback("ok");
    });
  }

  stop() {
    this.floatie.stopListening();
  }

  isDisabledDomain() {
    return this.unsupportedHosts.indexOf(window.location.host) >= 0;
  }
}

const cs = new ContentScript();
cs.start();

// There are many iframes in a window. Uncomment below to see.
// console.log("cs: initialized on window:", window.location)
