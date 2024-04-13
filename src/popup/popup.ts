import analytics from "../utils/analytics";

document.addEventListener("DOMContentLoaded", async () => {
  await analytics.firePageViewEvent("Popup", "/popup.html");
  window.onerror = (event, source, lineno, colno, error) => {
    analytics.fireErrorEvent(error, {
      event: event,
      source: source,
      lineno: lineno,
    });
  };
});

document.querySelector("#go-to-options").addEventListener("click", () => {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL("options.html"));
  }
});
