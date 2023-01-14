/**
 * Inserts a "Reload" button for reloading the extension.
 *
 * Currently only works with popup. Alternatives considered:
 * 1. Insert the button directly into the page, onclick content-script
 * would message background page to reload. One issue is that the content-script
 * would lose context.
 * 2. Have the gulp tasks ping the extension to reload itself - https://stackoverflow.com/a/19866346. This is an overkill.
 */
const p = document.createElement("p");
p.innerHTML = "<button id=\"reload-extension\">Reload xtension</button>";
document.querySelector("body").appendChild(p);
document.querySelector("#reload-extension").addEventListener(
    "click",
    () => {
      chrome.runtime.reload();
    },
);
