import "@webcomponents/custom-elements";
import { Toast } from "bootstrap";
import "./settings.css";
import formHtml from "./settings.txt.html";
import Storage from "../storage.js";
import { Logger } from "../logger.js";
import { i18n } from "../i18n.js";

export interface SelectOption {
  id: string;
  text: string;
}

export interface Config {
  id: string;
  title: string;
  description: string;
  type: "checkbox" | "switch" | "range" | "select" | "radio";
  default_value: string | boolean | number;

  value?: any;
  options?: SelectOption[];
  min?: string;
  max?: string;
}

export class SettingsUI extends HTMLElement {
  configItems: Config[];
  template = new DOMParser().parseFromString(formHtml, "text/html");
  logger = new Logger(this);

  constructor(configItems: Config[]) {
    // Always call super first in constructor
    super();

    this.configItems = configItems;
    // Create a shadow root
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.logger.debug("SettingsUI added to page.");

    this.fetchAndSetConfigValues(this.configItems).then((options) => {
      this.render(options);
    });
  }
  disconnectedCallback() {
    this.logger.debug("SettingsUI element removed from page.");
  }

  adoptedCallback() {
    this.logger.debug("SettingsUI element moved to new page.");
  }

  // Fetch value of each option from storage, set to default_value otherwise.
  async fetchAndSetConfigValues(options: Config[]) {
    for (const option of options) {
      const val = await Storage.get(option.id);
      if (val == null || val === undefined) {
        option.value = option.default_value;
      } else {
        option.value = val;
      }
    }
    return options;
  }

  render(options: Config[]): void {
    this.logger.debug("Rendering options: ", options);
    // Add the stylesheet.
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = chrome.runtime.getURL("utils/settings/settings.css");
    this.shadowRoot?.append(style);

    // Generate the form from template.
    const output = document.createElement("ul");
    output.className = "list-group";
    options.forEach((o) => output.appendChild(this.cloneInput(o)));
    this.shadowRoot?.append(output);
  }

  async saveChange(config: Config, updatedValue) {
    this.logger.debug("saving: ", config.id, updatedValue);
    await Storage.put(config.id, updatedValue);
    this.showToast();
  }

  // Clone the template and set the title, description, and value.
  cloneInput(config: Config): HTMLElement {
    let control = this.template
      .getElementsByClassName(`${config.type}-template`)[0]
      .cloneNode(true) as HTMLElement;

    // Set the title and description of the control.
    control.getElementsByClassName(`control-title`)[0].innerHTML = i18n(
      config.title
    );
    control.getElementsByClassName(`control-description`)[0].innerHTML = i18n(
      config.description
    );

    // Set up the value of the controls and wire-up change listeners.
    const actualInput = control.getElementsByClassName(
      "control-input"
    )[0] as HTMLInputElement;

    if (["checkbox", "switch"].includes(config.type)) {
      actualInput.checked = !!config.value;
      actualInput.addEventListener("input", (e: Event) =>
        this.saveChange(config, (e.target as HTMLInputElement).checked)
      );
    } else {
      actualInput.value = config.value;
    }

    if (config.type === "range") {
      actualInput.min = config.min ?? "0";
      actualInput.max = config.max ?? "5";
      actualInput.addEventListener("input", (e: Event) =>
        this.saveChange(config, (e.target as HTMLInputElement).value)
      );
    }

    if (config.type === "select") {
      config.options?.forEach((o) => {
        (actualInput as unknown as HTMLSelectElement).add(
          new Option(o.text, o.id, o.id === config.value)
        );
      });
      (actualInput as unknown as HTMLSelectElement).selectedIndex =
        config.options?.findIndex((o) => o.id === config.value) ?? -1;
      actualInput.addEventListener("change", (e: Event) =>
        this.saveChange(config, (e.target as HTMLInputElement).value)
      );
    }

    if (config.type === "radio") {
      config.options?.forEach((o) => {
        const radioInput = document.createElement("input");
        radioInput.type = "radio";
        radioInput.name = config.id;
        radioInput.value = o.id;
        radioInput.id = `${config.id}-${o.id}`;
        radioInput.autocomplete = "off";
        radioInput.className = "btn-check";
        radioInput.checked = o.id === config.value;
        actualInput.appendChild(radioInput);

        const radioLabel = document.createElement("label");
        radioLabel.className = "btn btn-outline-primary";
        radioLabel.htmlFor = radioInput.id;
        radioLabel.appendChild(document.createTextNode(o.text));
        actualInput.appendChild(radioLabel);
      });
      actualInput.addEventListener("input", (e: Event) =>
        this.saveChange(config, (e.target as HTMLInputElement).value)
      );
    }

    return control;
  }

  showToast() {
    // Check if element is already inserted and use it, other-wise, add it.
    let toastEl = this.shadowRoot?.querySelector(".toast-container");
    if (!toastEl) {
      toastEl = this.template.querySelector(".toast-container")!;
      this.shadowRoot?.append(toastEl);
    }
    const toast = new Toast(toastEl.querySelector("#liveToast"), {
      delay: 1000,
    });
    this.logger.log("showing toast: ", toast);
    toast.show();
  }
}

customElements.define("settings-ui", SettingsUI);
