import { Logger } from "../logger";

const L = new Logger("translate");

export function translateKeys() {
  const translatedKeys: string[] = [];
  document.querySelectorAll("[translate-key]").forEach((el) => {
    const key = el.getAttribute("translate-key");
    if (!key) {
      return;
    }
    el.innerHTML = chrome.i18n.getMessage(key);
    translatedKeys.push(key);
  });
  L.debug("Translated ", translatedKeys);
}

window.addEventListener("load", () => {
  translateKeys();
});
