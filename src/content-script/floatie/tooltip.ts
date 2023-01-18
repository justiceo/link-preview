import "@webcomponents/webcomponentsjs"; // polyfill for customElements in content scripts, https://stackoverflow.com/q/42800035.
import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("better-preview-tooltip")
export class Tooltip extends LitElement {
  static styles = css`
    * {
      color: green;
      border: 2px solid black;
      padding: 3px;
    }
  `;
  render() {
    return html` <h1>Hello from Tooltip Element!</h1> `;
  }
}
