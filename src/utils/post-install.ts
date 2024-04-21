import Analytics from "./analytics";
import Storage from "./storage";
import { INSTALL_TIME_MS } from "./storage";
import manifest from "../manifest.json";

export function runPostInstall() {
  const uninstallUrl = manifest.__uninstall_url;
  const welcomeUrl = chrome.runtime.getURL(manifest.__welcome_page);

  const onInstalled = (details: chrome.runtime.InstalledDetails) => {
    // Set the installation time in storage.
    Storage.put(INSTALL_TIME_MS, Date.now());

    // On fresh install, open page how to use extension.
    if (details.reason === "install") {
      chrome.tabs.create({
        url: welcomeUrl,
        active: true,
      });
      Analytics.fireEvent("install", { reaason: details.reason });
    }

    // Set url to take users upon uninstall.
    chrome.runtime.setUninstallURL(uninstallUrl, () => {
      if (chrome.runtime.lastError) {
        console.error("Error setting uninstall URL", chrome.runtime.lastError);
      }
    });
  };
  chrome.runtime.onInstalled.addListener(onInstalled);
}
