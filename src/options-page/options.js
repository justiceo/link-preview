import "../content-script/content-script"; // To inject popup for dev mode.
import { JsonForm } from "../utils/options/json-form";
import "./options.css";

async function loadForm() {
  // Clear storage after any changes to schema.
  // await chrome.storage.sync.clear();

  let options = await chrome.storage.sync.get(null);
  if(Object.keys(options).length == 0) {
    await chrome.storage.sync.set({
      'check-id': {
        id: "check-id",
        type: "checkbox",
        title: "Sample checkbox title",
        description: "The detail information about the checkbox here.",
        value: true,
      },
      "radio-id": {
        id: "radio-id",
        type: "radio",
        title: "Sample radio title",
        description: "The detail information about the radio here.",
        value: 1,
      },
      "switch-id": {
        id: "switch-id",
        type: "switch",
        title: "Sample switch title",
        description: "The detail information about the switch here.",
        value: false
      },
      "select-id": {
        id: "select-id",
        type: "select",
        title: "Sample select title",
        description: "The detail information about the select here.",
        value: 2,
      },
      "range-id": {
        id: "range-id",
        type: "range",
        title: "Sample range title",
        description: "The detail information about the range here.",
        value: 0,
      },
      "textarea-id": {
        id: "textarea-id",
        type: "textarea",
        title: "Sample textarea title",
        description: "The detail information about the textarea here.",
        value: 'hello world'
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
