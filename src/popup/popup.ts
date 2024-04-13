import analytics from "../utils/analytics";
import ExtPay from "../background-script/ExtPay";
import { extensionId } from "../utils/i18n";

const extpay = ExtPay(extensionId);

document.addEventListener("DOMContentLoaded", async () => {
  await analytics.firePageViewEvent("Popup", "/popup.html");
  window.onerror = (event, source, lineno, colno, error) => {
    analytics.fireErrorEvent(error, {
      event: event,
      source: source,
      lineno: lineno,
    });
  };

  extpay.getUser().then((user) => {
    if (user.paid) {
      console.log("User is premium");
    } else {
      console.log("Opening payment page");
      extpay.openPaymentPage();
    }
  });
});

document.querySelector("#go-to-options").addEventListener("click", () => {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL("options.html"));
  }
});
