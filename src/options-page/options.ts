import "../content-script/content-script"; // To inject popup for dev mode.
import { Config, SettingsUI } from "../utils/settings/settings";
import "./options.css";

const configOptions: Config[] = [
  {
    id: "automatically-hide-previews",
    type: "switch",
    title: "Automatically hide previews",
    description: "The detail information about the radio here.",
    default_value: false,
  },
  {
    id: "hide-previews-delay",
    type: "range",
    title: "How long to wait before automatically hiding previews (in seconds)",
    description: "The detail information about the range here.",
    default_value: 3,
  },
  {
    id: "default-search-engine",
    type: "select",
    title: "Set default search engine",
    description: "The detail information about the switch here.",
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
    id: "show-copy-action",
    type: "switch",
    title: "Show copy action",
    description: "The detail information about the select here.",
    default_value: false,
  },
  {
    id: "preview-on-hover",
    type: "switch",
    title: "Display preview on hover (no need to click)",
    description: "The detail information about the range here.",
    default_value: false,
  },
  {
    id: "sync-settings",
    type: "switch",
    title: "Enable chrome sync",
    description: "The detail information about the textarea here.",
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

document
  .querySelector(".options-container")
  ?.appendChild(new SettingsUI(configOptions));
