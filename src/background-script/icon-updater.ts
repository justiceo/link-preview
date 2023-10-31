// If not using this component, remove "tabs" permission.

// Re-run when user navigates within tab.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, _tab) => {
  chrome.tabs.get(tabId, (tab) => updateIcon(tab.url));
});

// Re-run when switch tab.
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => updateIcon(tab.url));
});

// Automatically disable icon on webstore and new tab pages.
// FYI: window.alert and window.confirm are now disabled in MV3.
const updateIcon = (url?: string) => {
  const icon =
    !url ||
    !url.trim() ||
    url.startsWith("chrome-extension://") ||
    url.startsWith("chrome://newtab/") ||
    url.startsWith("https://chrome.google.com/webstore")
    ? "assets/logo-gray-128x128.png"
    : "assets/logo-128x128.png";
  chrome.action.setIcon({ path: chrome.runtime.getURL(icon) });
};
