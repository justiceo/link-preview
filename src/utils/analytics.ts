// Code below imported from https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/functional-samples/tutorial.google-analytics/scripts/google-analytics.js
// https://developer.chrome.com/docs/extensions/mv3/tut_analytics/
import manifest from "../manifest.json";
import { getOrCreateSessionId } from "./session-id";

const GA_ENDPOINT = "https://www.google-analytics.com/mp/collect";
const GA_DEBUG_ENDPOINT = "https://www.google-analytics.com/debug/mp/collect";

// Get via https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events?client_type=gtag#recommended_parameters_for_reports
const MEASUREMENT_ID = manifest.__measurement_id__;
const API_SECRET = manifest.__ga_api_secret__;
const DEFAULT_ENGAGEMENT_TIME_MSEC = 100;

declare var IS_DEV_BUILD: boolean;
export class Analytics {
  debug = IS_DEV_BUILD;
  constructor() {}

  // Returns the client id, or creates a new one if one doesn't exist.
  // Stores client id in local storage to keep the same client id as long as
  // the extension is installed.
  async getOrCreateClientId() {
    let { clientId } = await chrome.storage.local.get("clientId");
    if (!clientId) {
      // Generate a unique client ID, the actual value is not relevant
      clientId = self.crypto.randomUUID();
      await chrome.storage.local.set({ clientId });
    }
    return clientId;
  }

  // Returns the current session id, or creates a new one if one doesn't exist or
  // the previous one has expired.
  // TODO: This function should not fire events when use in service-worker.
  async getSessionId() {
    try {
      return getOrCreateSessionId();
    } catch (e) {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage("get_or_create_session_id", (sessionId) => {
          resolve(sessionId);
        });
      });
    } 
  }

  // Fires an event with optional params. Event names must only include letters and underscores.
  async fireEvent(name, params: any = {}) {
    // Configure session id and engagement time if not present, for more details see:
    // https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events?client_type=gtag#recommended_parameters_for_reports
    if (!params.session_id) {
      params.session_id = await this.getSessionId();
    }
    if (!params.engagement_time_msec) {
      params.engagement_time_msec = DEFAULT_ENGAGEMENT_TIME_MSEC;
    }

    try {
      const response = await fetch(
        `${
          this.debug ? GA_DEBUG_ENDPOINT : GA_ENDPOINT
        }?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`,
        {
          method: "POST",
          body: JSON.stringify({
            client_id: await this.getOrCreateClientId(),
            events: [
              {
                name,
                params,
              },
            ],
          }),
        }
      );
      if (!this.debug) {
        return;
      }
      console.log(await response.text());
    } catch (e) {
      console.error("Google Analytics request failed with an exception", e);
    }
  }

  // Fire a page view event.
  async firePageViewEvent(pageTitle, pageLocation, additionalParams = {}) {
    return this.fireEvent("page_view", {
      page_title: pageTitle,
      page_location: pageLocation,
      ...additionalParams,
    });
  }

  // Fire an error event.
  async fireErrorEvent(error, additionalParams = {}) {
    // Note: 'error' is a reserved event name and cannot be used
    // see https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference?client_type=gtag#reserved_names
    return this.fireEvent("extension_error", {
      ...error,
      ...additionalParams,
    });
  }
}

export default new Analytics();
