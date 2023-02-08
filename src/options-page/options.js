import "../content-script/content-script"; // To inject popup for dev mode.
import { JsonForm } from "../utils/options/json-form";
import "./options.css";

async function loadForm() {
  // Clear storage after any changes to schema.
  await chrome.storage.sync.clear();

  let options = await chrome.storage.sync.get(null);
  if(Object.keys(options).length == 0) {
    await chrome.storage.sync.set({
      'disable-on-this-site': {
        id: "disable-on-this-site",
        type: "switch",
        title: "Disable Previews on this site",
        description: "The detail information about the checkbox here.",
        value: false,
      },
      "automatically-hide-previews": {
        id: "automatically-hide-previews",
        type: "switch",
        title: "Automatically hide previews",
        description: "The detail information about the radio here.",
        value: false,
      },
      "hide-previews-delay": {
        id: "hide-previews-delay",
        type: "range",
        title: "How long to wait before automatically hiding previews (in seconds)",
        description: "The detail information about the range here.",
        value: 3,
      },
      "default-search-engine": {
        id: "default-search-engine",
        type: "select",
        title: "Set default search engine",
        description: "The detail information about the switch here.",
        value: false
      },
      "show-copy-action": {
        id: "show-copy-action",
        type: "switch",
        title: "Show copy action",
        description: "The detail information about the select here.",
        value: false,
      },
      "preview-on-hover": {
        id: "preview-on-hover",
        type: "switch",
        title: "Display preview on hover (no need to click)",
        description: "The detail information about the range here.",
        value: false,
      },
      "sync-settings": {
        id: "sync-settings",
        type: "switch",
        title: "Enable chrome sync",
        description: "The detail information about the textarea here.",
        value: false,
      },
    });
    options = await chrome.storage.sync.get(null);
  }
  console.log("options in storage", options);
  let j2f = new JsonForm();
  const form = j2f.render(Object.values(options), document);
  document.querySelector(".options-container").appendChild(form);
}
loadForm();
