import Storage from "../utils/storage";
import { FEEDBACK_DATA_KEY, INSTALL_TIME_MS,SUCCESSFUL_INTERACTIONS } from "../utils/storage";
import { Logger } from "../utils/logger";

export type FeedbackData = {
  status: "honored" | "ignored" | "eligible" | "ineligible" | undefined;
  timestamp: number;
  rating?: number;
};

// This checker runs in the service worker and determines the appropriate time to show the feedback form.
// It marks this determination by setting feedback_status="is_eligible_for_feedback" in the Storage area.
// Considerations: call #shouldRequestFeedback directly from feedback form: FeedbackForm maybe embedded in page context, which has no access to some Chrome APIs
// Ideally, feedback should be shown after one of many successful interactions, to a long-term user, who is not in Incognito.
class FeedbackChecker {
  DAY_MS = 86_400_000;
  logger = new Logger(this);

  // Runs a check to determine if the trigger for showing feedback form should be set.
  async runFeedbackCheck(tabInfo?: chrome.tabs.Tab) {
    if (await this.shouldRequestFeedback(tabInfo)) {
      const feedbackData: FeedbackData = {
        status: "eligible",
        timestamp: Date.now(),
      }
      Storage.put(FEEDBACK_DATA_KEY, feedbackData);
      return;
    }

    // Reset to ineligible if already marked as eligible (otherwise it might be honored).
    const feedbackData = await Storage.get(FEEDBACK_DATA_KEY);
    if(feedbackData?.status == "eligible") {
      const newFeedbackStatus: FeedbackData = {
        status: "ineligible",
        timestamp: Date.now(),
      }
      Storage.put(FEEDBACK_DATA_KEY, newFeedbackStatus);
      return;
    }
  }

  async shouldRequestFeedback(tabInfo?: chrome.tabs.Tab) {
    const isNormalWindow = !(await this.isIncognito(tabInfo));
    const isSignedIn = await this.isSignedInToGoogle();
    const isAgedInstallation = await this.getDaysSinceInstallation() > 7 ;
    const hasSufficientSuccessfulInteractions =
      (await this.getSuccessCount()) >= 30;
    const isEligibleForReissue = await this.isEligibleForReissue();

    const isEligible =
      isNormalWindow &&
      isSignedIn &&
      isAgedInstallation &&
      hasSufficientSuccessfulInteractions &&
      isEligibleForReissue;

    this.logger.debug(
      `isEligible: ${isEligible}. Based on 
      isNormalWindow: ${isNormalWindow}, 
      isSignedIn: ${isSignedIn}, 
      isAgedInstallation: ${isAgedInstallation}, 
      hasSufficientSuccessfulInteractions: ${hasSufficientSuccessfulInteractions}, 
      isEligibleForReissue: ${isEligibleForReissue}`
    );

    return isEligible;
  }

  private async isIncognito(activeTabInfo?: chrome.tabs.Tab): Promise<boolean> {
    if (activeTabInfo && activeTabInfo.incognito) {
      return Promise.resolve(true);
    }

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const t = tabs.find((t) => t.incognito);
    return Promise.resolve(t !== undefined);
  }

  private async getSuccessCount(): Promise<number> {
    const successRecords: any[] = await Storage.get(SUCCESSFUL_INTERACTIONS);
    if (!successRecords) {
      return Promise.resolve(0);
    } else return Promise.resolve(successRecords.length);
  }

  // Returns true if the user is signed in to the Chrome browser.
  // Also true if a user launches an incognito window from a signed-in window.
  private isSignedInToGoogle(): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.cookies.get(
        { url: "https://accounts.google.com", name: "LSID" },
        (cookie) => {
          if (cookie) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      );
    });
  }

  private async getDaysSinceInstallation() {
    const installTimeMs = await Storage.get(INSTALL_TIME_MS);
    if (!installTimeMs) {
      // maybe undefined or null.
      await Storage.put(INSTALL_TIME_MS, Date.now());
      return Promise.resolve(0);
    }

    const diffTime = Date.now() - installTimeMs;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Promise.resolve(diffDays);
  }

  private async isEligibleForReissue(): Promise<boolean> {
    const feedback: FeedbackData = await Storage.get(FEEDBACK_DATA_KEY);

      // If no response yet, then user is eligible.
    if (!feedback) {
      return Promise.resolve(true);
    }

    // If feedback has been honored, don't ask again.
    if(feedback.status === "honored") {
      // TODO: If the response wasn't good, ask again after 30 days.
      return Promise.resolve(false);
    }

    // If it has not been long since we last asked, hold off.
    // if(Date.now() - feedback.timestamp < this.DAY_MS) {
    //   return Promise.resolve(false);
    // }

    // Otherwise, user is eligible for feedback.
    return Promise.resolve(true);
  }
}

// Run the checker everytime the user navigates to new page.
// This strategy would work even for popup-based extensions (since chrome.action.Onclicked won't fire when there's a popup).
const checker = new FeedbackChecker();
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => checker.runFeedbackCheck(tab));
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, _tab) => {
  chrome.tabs.get(tabId, (tab) => checker.runFeedbackCheck(tab));
});
