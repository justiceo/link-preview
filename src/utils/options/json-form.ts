import bootstrap from "./bootstrap.bundle.min.js";
import "./bootstrap.min.css";
import formHtml from './json-form.txt.html'; // Loaded as text.

class JFElement extends HTMLElement {
  constructor() {
    // Always call super first in constructor
    super();

    // Element functionality written in here
  }
}
export class JsonForm {
  template!: HTMLElement;

  // See https://netbasal.com/supercharge-your-forms-in-web-components-with-lit-5df42430907a
  // as potential alternative using lit.
  render(options: any[]): HTMLElement {
    this.template = document.createElement('div');
    this.template.innerHTML= formHtml;

    const output = document.createElement("ul");
    output.className = "list-group";
    options.forEach((o) => output.appendChild(this.cloneInput(o)));

    // Uncomment to wrap with shadowDom, however ShadowDom by itself doesn't fix the issue of inline styles bleeding (even using lit)
    // customElements.define("json-form", JFElement);
    // let jf = document.createElement("json-form");
    // let shadowRoot = jf.attachShadow({mode: "open"});
    // shadowRoot.appendChild(output);
    // return jf;
    return output;
  }

  async saveChange(option, updatedValue) {
    console.debug("saving: ", option.id, updatedValue);
    let configToSave =  {}
    option.value = updatedValue;
    configToSave[option.id] = option;
    await chrome.storage.sync.set(configToSave);
    this.showToast();
  }

  cloneInput(option): HTMLElement {
    let input = this.template
      .getElementsByClassName(`${option.type}-template`)[0]
      .cloneNode(true) as HTMLElement;

    input.getElementsByClassName(`control-title`)[0].innerHTML = option.title;
    input.getElementsByClassName(`control-description`)[0].innerHTML =
      option.description;

    const eventHandler = (e: Event) => {
      const data =
        ["checkbox", "switch"].indexOf(option.type) >= 0 ? e.target?.checked : e.target?.value;
      this.saveChange(option, data);
    };

    const actualInput = input.getElementsByClassName(
      "control-input"
    )[0] as HTMLInputElement;
    ["checkbox", "switch"].indexOf(option.type) >= 0 ? actualInput.checked = !!option.value: actualInput.value = option.value;

    option.type === "select"
      ? actualInput.addEventListener("change", eventHandler)
      : actualInput.addEventListener("input", eventHandler);

    if(option.type === "range") {
      actualInput.min = option.min;
      actualInput.max = option.max;
    }
    if(option.type === "select") {
      option.options.forEach(e => {
        (actualInput as unknown as HTMLSelectElement).add(new Option(e, e));
      });
    }

    return input;
  }

  showToast() {
    // Check if element is already inserted and use it, other-wise, add it.
    let toastEl = document.body.querySelector(":scope > .toast-container");
    if(!toastEl) {
      toastEl = this.template.querySelector(".toast-container")!;
      document.body.appendChild(toastEl);
    }
    const toast = new bootstrap.Toast(toastEl.querySelector("#liveToast"));
    console.log("showing toast: ", bootstrap, toast);
    toast.show();
  }
}
