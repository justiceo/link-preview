import { Logger } from "../utils/logger";
import "./previewr";
import "./iframe-helper";
import { Floatie } from "./floatie/floatie";

class ContentScript {
  floatie = new Floatie();
  logger = new Logger(this);
  unsupportedHosts = ["mail.google.com"];

  constructor() {}

  start() {
    if (this.isDisabledDomain()) {
      this.logger.warn("Better Previews is disabled on ", window.location.host);
      return;
    }

    this.floatie.startListening();

    chrome.runtime.onMessage.addListener((request, sender, callback) => {
      this.logger.debug("Re-posting message for DOM: ", request);
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