import "../content-script/content-script"; // To inject popup for dev mode.
import { Config, SettingsUI } from "../utils/settings/settings";
import "./options.css";
import manifest from "../manifest.json";

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
    id: "previewr-width",
    type: "range",
    title: "Preview Width (%)",
    description: "The width of the preview panel relative to the page.",
    default_value: 40,
    min: "20",
    max: "90",
  },
  {
    id: "previewr-height",
    type: "range",
    title: "Preview Height (%)",
    description: "The height of the preview panel relative to the page.",
    default_value: 70,
    min: "20",
    max: "95",
  },
  {
    id: "previewr-position",
    type: "select",
    title: "Panel Position",
    description: "The side of the page in which to display the preview.",
    default_value: "right",
    options: [
      { id: "right", text: "Right" },
      { id: "left", text: "Left" },
    ],
  },
  {
    id: "close-on-esc",
    type: "switch",
    title: "Close on Escape",
    description: "Use the ESC (escape) key to close the preview panel.",
    default_value: true,
  },
  {
    id: "automatically-hide-previews",
    type: "switch",
    title: "Automatically Hide Previews",
    description:
      "Hides the preview panel when you scroll away or interact with the main page.",
    default_value: false,
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
    title: "[Advanced] Force Preview",
    description:
      "For websites that **really** do not want to be previewed (e.g. stackoverflow.com) this forces a preview. Nerd alert: this is a frame-busting buster.",
    default_value: false,
  },
  {
    id: "disable-incognito-google",
    type: "switch",
    title: "[Advanced] Disable Incognito Google",
    description:
      "By default, the version of Google search used is always signed-out for privacy and security reasons. Though this may result in always seeing sign-in prompts.",
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
      {
        application: manifest.__package_name__,
        action: "search",
        data: "hello world",
      },
      window.location.origin,
    );
  });
});
