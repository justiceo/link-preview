import { Logger } from "../utils/logger";
import "./previewr";
import "./iframe-helper";
import { Floatie } from "./floatie/floatie";
import Storage from "../utils/storage";
import manifest from "../manifest.json";

class ContentScript {
  floatie = new Floatie();
  logger = new Logger(this);
  unsupportedHosts = ["mail.google.com"];

  constructor() {}

  async start() {
    if (await this.isDisabledDomain()) {
      // TODO: Prevent all script injection on unsupported hosts.
      this.logger.debug(
        "Better Previews is disabled on ",
        window.location.host,
      );
      return;
    }
    this.floatie.startListening();

    if (!this.inIframe()) {
      chrome.runtime.onMessage.addListener((request, sender, callback) => {
        this.logger.debug("Re-posting message for DOM: ", request);
        window.postMessage({
          application: manifest.__package_name__,
          ...request,
        });
        callback("ok");
      });
    }
  }

  stop() {
    this.floatie.stopListening();
  }

  async isDisabledDomain() {
    const blockedSites: string = (await Storage.get("blocked-sites")) ?? "";
    if (!blockedSites) {
      return false;
    }
    const host = window.location.hostname;
    return blockedSites.includes(host);
  }

  inIframe() {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }
}

const cs = new ContentScript();
cs.start();
