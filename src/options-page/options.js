import bootstrap from './bootstrap.bundle.min.js'
import './bootstrap.min.css'
import './options.css'
import '../content-script/content-script' // To inject popup for dev mode.

class Json2Form {
  render(options) {
    console.log("rendering options: ", options);
    options.forEach((o) => {
      switch (o.type) {
        case "checkbox":
          this.applyCheckbox(this.cloneInput(o), o);
          break;
        case "switch":
          this.applyCheckbox(this.cloneInput(o), o);
          break;
        case "radio":
          this.applyRadio(this.cloneInput(o), o);
          break;
        case "select":
          this.applySelect(this.cloneInput(o), o);
          break;
        case "textarea":
          this.applyTextarea(this.cloneInput(o), o);
          break;
        case "range":
          this.applyRange(this.cloneInput(o), o);
          break;
      }
    });
  }

  applyCheckbox(el, data) {
    el.getElementsByTagName("input")[0].checked = !!data.checked;
    el.getElementsByTagName("input")[0].addEventListener("change", (e) => {
      this.saveChange(data.id, e.target.checked);
    });
  }

  applyRadio(el, data) {
    // TODO
  }

  applySelect(el, data) {
    el.getElementsByTagName("select")[0].addEventListener(
      "change",
      (e) => {
        console.log("event: ", e);
        this.saveChange(data.id, e.target.value);
      },
      false
    );
  }

  applyTextarea(el, data) {
    // TODO: Add debounce
    el.getElementsByTagName("textarea")[0].addEventListener(
      "input",
      (e) => {
        console.log("event: ", e);
        this.saveChange(data.id, e.target.value);
      },
      false
    );
  }
  
  applyRange(el, data) {
    el.getElementsByTagName("input")[0].addEventListener(
      "input",
      (e) => {
        console.log("range event: ", e);
        this.saveChange(data.id, e.target.value);
      },
      false
    );
  }

  saveChange(fieldId, updatedValue) {
    console.log("saving: ", fieldId, updatedValue);
    this.showToast();
  }

  cloneInput(option) {
    let input = document
      .getElementsByClassName(`${option.type}-template`)[0]
      .cloneNode(true);

    input.getElementsByClassName(`control-title`)[0].innerHTML = option.title;
    input.getElementsByClassName(`control-description`)[0].innerHTML =
      option.description;
    document.getElementsByClassName("real-list")[0].appendChild(input);
    return input;
  }

  showToast() {
    const toastLiveExample = document.getElementById("liveToast");
    const toast = new bootstrap.Toast(toastLiveExample);
    toast.show();
  }
}

let j2f = new Json2Form();
j2f.render([
  {
    id: "check-id",
    type: "checkbox",
    title: "Sample checkbox title",
    description: "The detail information about the checkbox here."
  },
  {
    id: "radio-id",
    type: "radio",
    title: "Sample radio title",
    description: "The detail information about the radio here."
  },
  {
    id: "switch-id",
    type: "switch",
    title: "Sample switch title",
    description: "The detail information about the switch here."
  },
  {
    id: "select-id",
    type: "select",
    title: "Sample select title",
    description: "The detail information about the select here."
  },
  {
    id: "range-id",
    type: "range",
    title: "Sample range title",
    description: "The detail information about the range here."
  },
  {
    id: "textarea-id",
    type: "textarea",
    title: "Sample textarea title",
    description: "The detail information about the textarea here."
  }
]);

