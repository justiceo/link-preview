import "@webcomponents/custom-elements";
// @ts-ignore: This HTML is loaded as plain text.
import markup from "./feedback.txt.html";
// @ts-ignore: This CSS is loaded as plain text.
import css from "./feedback.txt.css";
import { i18n } from "../i18n";
import { Logger } from "../logger";

/* A simple inline form that supports three sizes: inline, small and medium.

To update in REPL mode, see https://codepen.io/justiceo/pen/mdGGPxY.

Usage:
<feedback-form
    app-name="Extension"
    logo-url="https://upload.wikimedia.org/wikipedia/commons/4/4f/SVG_Logo.svg" 
    store-link="http://example.com"            
    size="medium">
</feedback-form>
*/
class FeedbackForm extends HTMLElement {
  logger = new Logger("feedback-form");
  progressHandler;
  constructor() {
    super();

    // Create a shadow root
    this.attachShadow({ mode: "open" }); // sets and returns 'this.shadowRoot'
  }

  setProgressHandler(fn) {
    this.progressHandler = fn;
  }

  static get observedAttributes() {
    return ["size", "app-name", "logo-url", "store-link", "form-link"];
  }

  connectedCallback() {
    this.logger.debug("Feedback form added to page.");
    this.updateStyle(this);
  }
  disconnectedCallback() {
    this.logger.debug("Feedback form removed from page.");
  }

  adoptedCallback() {
    this.logger.debug("Feedback form moved to new page.");
  }

  updateStyle(elem) {
    const style = document.createElement("style");
    style.textContent = css;

    const range = document.createRange();
    range.selectNode(document.getElementsByTagName("body").item(0));
    const documentFragment = range.createContextualFragment(markup);

    const shadow = elem.shadowRoot;
    shadow.append(style, documentFragment);

    const size = elem.getAttribute("size") ?? "inline";
    const app = elem.getAttribute("app-name") ?? i18n("appName");
    const logo =
      elem.getAttribute("logo-url") ??
      chrome.runtime.getURL("assets/logo-24x24.png");
    const storeLink =
      elem.getAttribute("store-link") ??
      "https://chrome.google.com/webstore/detail/" + i18n("@@extension_id");
    const formLink =
      elem.getAttribute("form-link") ?? "https://formspree.io/f/mayzdndj";
    this.logger.debug(`Attributes: size=${size}, app=${app}, logo=${logo}`);

    const multiStepForm = shadow.querySelector("[data-multi-step]");
    multiStepForm.classList.remove("inline", "small", "medium");
    multiStepForm.classList.add(size);

    multiStepForm.querySelector("img").src = logo;
    multiStepForm.querySelector(".logo p").innerHTML = app;

    let currentStep = multiStepForm.getAttribute("data-current-step");

    if (!currentStep) {
      currentStep = 1;
      multiStepForm.setAttribute("data-current-step", currentStep);
    }

    const stars = [...multiStepForm.querySelectorAll(".star")];
    const jumpButtons = [...multiStepForm.querySelectorAll("[data-next-step]")];

    if (stars.length > 0) {
      const resetStarsClass = () =>
        stars.forEach((star) => (star.classList = ["star"]));

      const handleMouseOver = (event) => {
        const starIndex = event.target.getAttribute("data-star-index");
        resetStarsClass();

        stars.forEach((star, index) =>
          index < starIndex ? star.classList.add("full") : null,
        );
      };

      const handleStarClick = (event) => {
        const starIndex = event.target.getAttribute("data-star-index");
        if (this.progressHandler) {
          this.progressHandler("started", starIndex);
        }

        currentStep = starIndex < 5 ? 3 : 2;

        multiStepForm.setAttribute("data-current-step", currentStep);
      };

      stars.forEach((star) =>
        star.addEventListener("mouseover", handleMouseOver),
      );
      stars.forEach((star) => star.addEventListener("click", handleStarClick));
      multiStepForm.addEventListener("mouseleave", resetStarsClass);
    }

    jumpButtons.forEach((button) =>
      button.addEventListener("click", (event) => {
        currentStep = event.target.getAttribute("data-next-step");
        multiStepForm.setAttribute("data-current-step", currentStep);

        // Handle click on "rate on webstore".
        if (button.id === "rate-on-store") {
          window.open(storeLink);
        }

        // TODO: Fix this section to send comprehensive and correct data.
        const data = {
          feedback: multiStepForm.querySelector("input").value,
          appName: app,
        };

        // Handle feedback submission.
        if (button.id === "submit-form") {
          fetch(formLink, {
            method: "POST",
            body: JSON.stringify(data),
          })
            .then(function (response) {
              return this.logger.debug("response", response.json());
            })
            .then(function (response) {
              this.logger.debug("response 2", response.json());
            });
        }

        // Auto-close at the end.
        if (currentStep == 4) {
          setTimeout(() => {
            if (this.progressHandler) {
              this.progressHandler("completed", data);
            }
          }, 1300);
        }
      }),
    );
  }
}

customElements.define("feedback-form", FeedbackForm);
