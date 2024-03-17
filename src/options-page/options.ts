import "../content-script/content-script"; // To inject popup for dev mode.
import { Config, SettingsUI } from "../utils/settings/settings";
import "./options.css";
import manifest from "../manifest.json";
import { i18n, translateMarkup } from "../utils/i18n";

const configOptions: Config[] = [
  {
    id: "search-engine",
    type: "select",
    title: i18n("Search engine"),
    description: i18n(
      "The search engine that would be used for inline search previews.",
    ),
    default_value: "google",
    options: [
      { id: "google", text: i18n("Google Search") },
      { id: "bing", text: i18n("Bing Search") },
      { id: "yahoo", text: i18n("Yahoo Search") },
      { id: "baidu", text: i18n("Baidu Search") },
      { id: "yandex", text: i18n("Yandex Search") },
    ],
  },
  {
    id: "previewr-width",
    type: "range",
    title: i18n("Preview Width (%)"),
    description: i18n("The width of the preview panel relative to the page."),
    default_value: 40,
    min: "20",
    max: "90",
  },
  {
    id: "previewr-height",
    type: "range",
    title: i18n("Preview Height (%)"),
    description: i18n("The height of the preview panel relative to the page."),
    default_value: 70,
    min: "20",
    max: "95",
  },
  {
    id: "previewr-position",
    type: "select",
    title: i18n("Panel Position"),
    description: i18n("The side of the page in which to display the preview."),
    default_value: "right",
    options: [
      { id: "right", text: i18n("Right side") },
      { id: "left", text: i18n("Left side") },
    ],
  },
  {
    id: "close-on-esc",
    type: "switch",
    title: i18n("Close on Escape Key"),
    description: i18n("Use the ESC (escape) key to close the preview panel."),
    default_value: true,
  },
  {
    id: "automatically-hide-previews",
    type: "switch",
    title: i18n("Automatically Hide Previews"),
    description: i18n(
      "Hides the preview panel when you scroll away or interact with the main page.",
    ),
    default_value: false,
  },
  {
    id: "preview-in-side-panel",
    type: "switch",
    title: i18n("Preview in Side Panel"),
    description: i18n(
      "Displays the view in Chrome Side Panel instead of a floating box.",
    ),
    default_value: false,
    dev_only: true,
  },
  {
    id: "preview-on-hover",
    type: "switch",
    title: "Automatic Preview on Hover",
    description:
      "No need to click on tooltip button, auto show preview on hover.",
    default_value: false,
  },
  {
    id: "preview-on-hover-delay",
    type: "range",
    title: i18n("Preview-on-Hover Delay"),
    description: i18n(
      "When automatic preview on hover is enabled, this is the delay before the preview is shown.",
    ),
    default_value: 3,
    min: "1",
    max: "5",
  },
  {
    id: "blocked-sites",
    type: "textarea",
    title: "Disabled on Websites",
    description:
      "Extension will not run on these sites. Enter one site per line.",
    default_value: "",
  },
  {
    id: "enable-anti-frame-busting",
    type: "switch",
    title: i18n("[Advanced] Force Preview"),
    description: i18n(
      "For websites that **really** do not want to be previewed (e.g. stackoverflow.com) this forces a preview. Nerd alert: this is a frame-busting buster.",
    ),
    default_value: false,
  },
  {
    id: "disable-incognito-google",
    type: "switch",
    title: i18n("[Advanced] Disable Incognito Google"),
    description: i18n(
      "By default, the version of Google search used is always signed-out for privacy and security reasons. Though this may result in always seeing sign-in prompts.",
    ),
    default_value: false,
  },
];

const iframeName = "betterpreviews.com/mainframe";
const pcl = new URL(window.location.href).protocol;
if (window.name === iframeName) {
  configOptions["disable-on-this-site"] = {
    id: "disable-on-this-site",
    type: "switch",
    title: i18n("Disable Previews on this site"),
    description: i18n("The detail information about the checkbox here."),
    value: false,
  };
} else {
  configOptions["disabled-on-sites"] = {
    id: "disabled-on-sites",
    type: "textarea",
    title: i18n("Disabled on Websites"),
    description: i18n(
      "Extension will not run on these sites, you can disable a site by adding to this list.",
    ),
    value: "example.com\nexample.org",
  };
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector(".options-container")
    ?.appendChild(new SettingsUI(configOptions));

  document.querySelector("#show-preview")?.addEventListener("click", () => {
    window.postMessage(
      {
        application: manifest.__package_name__,
        action: "search",
        data: "hello world",
      },
      window.location.origin,
    );
  });
  translateMarkup(document);
});
