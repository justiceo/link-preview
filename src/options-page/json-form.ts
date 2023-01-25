import bootstrap from "./bootstrap.bundle.min.js";

class JFElement extends HTMLElement {
  constructor() {
    // Always call super first in constructor
    super();

    // Element functionality written in here
  }
}
export class JsonForm {
  template!: Document;

  render(options: any[], template: Document): HTMLElement {
    this.template = template;
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

    return input;
  }

  showToast() {
    const toastLiveExample = this.template.querySelector("#liveToast");
    const toast = new bootstrap.Toast(toastLiveExample);
    toast.show();
  }
}
