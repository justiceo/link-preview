import "../content-script/content-script"; // To inject popup for dev mode.
import { Config, SettingsUI } from "../utils/settings/settings";
import "./options.css";

const configOptions: Config[] = [
  {
    id: "search-engine",
    type: "select",
    title: "Search engine",
    description:
      "The search engine that would be used for inline search previews.",
    default_value: "google",
    options: [
      { id: "google", text: "Google" },
      { id: "bing", text: "Bing" },
      { id: "yahoo", text: "Yahoo" },
      { id: "baidu", text: "Baidu" },
      { id: "yandex", text: "Yandex" },
    ],
  },
  {
    id: "automatically-hide-previews",
    type: "switch",
    title: "Automatically hide previews",
    description:
      "Hides the preview panel when you hit ESC, scroll away or interact with the main page.",
    default_value: false,
  },
  {
    id: "preview-on-hover",
    type: "switch",
    title: "Display preview on hover",
    description:
      "No need to click on tooltip button, auto show preview after 3secs.",
    default_value: false,
  },
  {
    id: "previewr-width",
    type: "range",
    title: "Preview Width (%)",
    description: "The width of the preview panel relative to the page.",
    default_value: 40,
    min: "20",
    max: "100",
  },
  {
    id: "previewr-height",
    type: "range",
    title: "Preview Height (%)",
    description: "The height of the preview panel relative to the page.",
    default_value: 70,
    min: "20",
    max: "100",
  },
  {
    id: "sync-settings",
    type: "switch",
    title: "Enable chrome sync",
    description:
      "Sync these settings across Chrome browsers where you're signed in.",
    default_value: false,
  },
];

const iframeName = "betterpreviews.com/mainframe";
const pcl = new URL(window.location.href).protocol;
if (window.name === iframeName) {
  configOptions["disable-on-this-site"] = {
    id: "disable-on-this-site",
    type: "switch",
    title: "Disable Previews on this site",
    description: "The detail information about the checkbox here.",
    value: false,
  };
} else {
  configOptions["disabled-on-sites"] = {
    id: "disabled-on-sites",
    type: "textarea",
    title: "Disabled on Websites",
    description:
      "Extension will not run on these sites, you can disable a site by adding to this list.",
    value: "example.com\nexample.org",
  };
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector(".options-container")
    ?.appendChild(new SettingsUI(configOptions));

  document.querySelector("#show-preview")?.addEventListener("click", () => {
    window.postMessage(
      { application: "better-previews", action: "search", data: "hello world" },
      window.location.origin
    );
  });

});