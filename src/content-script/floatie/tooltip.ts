import { arrow, computePosition, flip, offset, shift } from "@floating-ui/dom";
// import "./floatie.css";
import "@webcomponents/webcomponentsjs"; // polyfill for customElements in content scripts, https://stackoverflow.com/q/42800035.
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("better-preview-tooltip")
export class Tooltip extends LitElement {
  @property()
  tooltipVisible: boolean;
  @property()
  copyVisible: boolean;
  @property()
  searchVisible: boolean;
  @property()
  previewVisible: boolean;

  @property()
  selectedText: string;

  isCopyActionEnabled = false;
  showTimeout?: number;

  static styles = css`
    // #sp-floatie-container {
    //   position: absolute;
    //   top: 0;
    //   left: 0;
    //   background: #222222;
    //   color: white;
    //   border-radius: 4px;
    //   padding: 2px;
    //   font-size: 11px;
    //   font-family: sans-serif;
    // }

    // #sp-floatie-arrow {
    //   position: absolute;
    //   background: rgb(255, 34, 34);
    //   background: linear-gradient(
    //     -45deg,
    //     rgba(34, 34, 34, 1) 0%,
    //     rgba(34, 34, 34, 1) 51%,
    //     rgba(0, 0, 0, 0) 53%,
    //     rgba(0, 0, 0, 0) 80%
    //   );
    //   width: 8px;
    //   height: 8px;
    //   transform: rotate(45deg);
    // }

    // .sp-floatie-action {
    //   display: block;
    //   background-color: #222222;
    //   padding-top: 5px;
    //   padding-bottom: 5px;
    //   padding-left: 8px;
    //   padding-right: 8px;
    //   margin: 0 0 !important;
    // }

    // .sp-floatie-action:hover {
    //   background-color: #777;
    // }
  `;
  render() {
    return html`
      <div id="sp-floatie-container">
        <div id="sp-floatie-arrow"></div>
        <div
          id="sp-floatie-search"
          class="sp-floatie-action"
          data-action="search"
        >
          Search ${this.selectedText}
        </div>
        <div
          id="sp-floatie-preview"
          class="sp-floatie-action"
          data-action="preview"
        >
          Preview
        </div>
        <div id="sp-floatie-copy" class="sp-floatie-action" data-action="copy">
          Copy ${this.selectedText}
        </div>
      </div>
    `;
  }

  connectedCallback() {
    // Window level events.
    window.onscroll = () => this.hideAll();
    window.onresize = () => this.hideAll();

    // Do not display in contextMenu.
    window.oncontextmenu = () => this.hideAll();

    // TODO:  Do not display in contentEditable.

    // Listen for mouse up events and suggest search if there's a selection.
    document.onmouseup = (e) => this.deferredMaybeShow(e);
    document.onkeydown = () => this.hideAll();

    this.setupLinkPreviews();
  }

  /*
   * TODO: On search pages, only wire for search results.
   * On normal pages, display floatie on all links.
   */
  setupLinkPreviews() {
    const anchors = document.querySelectorAll("a");
    let showTimeout: any = null;
    let hideTimeout: any = null;
    anchors.forEach((a: HTMLAnchorElement) => {
      if (!this.isGoodUrl(a.href)) {
        return;
      }

      if (!a.innerText.trim()) {
        // There is no text, we may be highlighting an image.
        return;
      }

      // TODO: check if computed display is 'none', i.e. link is hidden.

      a.addEventListener("mouseover", (unused) => {
        if (hideTimeout) {
          clearTimeout(hideTimeout);
          hideTimeout = null;
        }

        showTimeout = setTimeout(() => {
          this.showActions(a.getBoundingClientRect(), a.href, ["preview"]);
        }, 500);
      });

      a.addEventListener("mouseout", () => {
        if (showTimeout) {
          clearTimeout(showTimeout);
          showTimeout = null;
        }
        hideTimeout = setTimeout(() => {
          this.hideAll();
        }, 2000);
      });
    });
  }

  stopListening(): void {
    // Remove all UI elements.
    this.tooltipVisible = false;

    // Remove window/document. listeners.
    document.removeEventListener("onmouseup", () => {});
    window.removeEventListener("onscroll", () => {});
    window.removeEventListener("onresize", () => {});
  }

  deferredMaybeShow(e: MouseEvent): void {
    // Allow a little time for cancellation.
    this.showTimeout = window.setTimeout(() => this.maybeShow(e), 100);
  }

  maybeShow(e: MouseEvent): void {
    // Ensure button is hidden by default.
    this.hideAll();

    // Filter out empty/irrelevant selections.
    if (typeof window.getSelection == "undefined") {
      return;
    }
    const selection = window.getSelection()!;
    if (selection.isCollapsed) {
      return;
    }

    // Show appropriate buttons.
    const selectedText = selection.toString().trim();
    const range = selection.getRangeAt(0);
    const boundingRect = range.getBoundingClientRect();
    console.debug("Selected: ", selectedText);
    const actionsToShow: string[] = [];
    if (this.shouldShowPreview(e, selectedText)) {
      actionsToShow.push("preview");
    } else if (this.shouldShowSearch(e, selectedText)) {
      actionsToShow.push("search");
    }
    if (this.shouldShowCopy(selectedText)) {
      actionsToShow.push("copy");
    }
    this.showActions(boundingRect, selectedText, actionsToShow);
  }

  getAbsoluteUrl(urlStr: string): URL | null {
    const absoluteUrlMatcher = new RegExp("^(?:[a-z+]+:)?//", "i");
    let url: URL;
    try {
      if (absoluteUrlMatcher.test(urlStr)) {
        url = new URL(urlStr);
      } else {
        url = new URL(urlStr, document.location.href);
      }
    } catch (e) {
      // href is an invalid URL
      return null;
    }
    return url;
  }

  isGoodUrl(urlStr: string): boolean {
    if (!urlStr || !urlStr.trim()) {
      // There is no link.
      return false;
    }

    const url = this.getAbsoluteUrl(urlStr);
    if (url === null) {
      return false;
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      // We don't want to preview other schemes like tel:
      return false;
    }

    if (url.hostname === window.location.hostname) {
      // Don't preview URLs of the same origin, not useful and potentially introduces bugs to the page.
      return false;
    }

    // TODO: investigate potential issues with displaying https over http and vice versa.

    return true;
  }

  shouldShowCopy(selectedText: string): boolean {
    return this.isCopyActionEnabled && selectedText.length > 0;
  }

  shouldShowPreview(
    e: MouseEvent | KeyboardEvent,
    selectedText: string,
  ): boolean {
    const isGoodHyperlink = (e: MouseEvent | KeyboardEvent) => {
      var target: any = e.target;
      do {
        if (
          target.nodeName.toUpperCase() === "A" &&
          this.isGoodUrl(target.href)
        ) {
          return true;
        }
      } while ((target = target.parentElement));
      return false;
    };

    return this.isGoodUrl(selectedText) || isGoodHyperlink(e);
  }

  shouldShowSearch(e: MouseEvent, selectedText: string): boolean {
    const isQuerySize = (text: string) => {
      return text.length > 0 && text.length < 100;
    };

    const isEmail = (email: string) => {
      return String(email)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        );
    };

    const isDate = (dataStr: string) => {
      return !isNaN(Date.parse(dataStr));
    };

    const hasLetters = (text: string) => {
      return /[a-zA-Z]/.test(text);
    };

    return (
      isQuerySize(selectedText) &&
      hasLetters(selectedText) &&
      !isEmail(selectedText) &&
      !isDate(selectedText) &&
      !this.shouldShowPreview(e, selectedText)
    );
  }

  showActions(boundingRect: DOMRect, text: string, buttons: string[]) {
    console.log("#showActions:", boundingRect, text, buttons);
    this.hideAll();
    this.selectedText = text;
    this.showContainer(boundingRect);
    buttons.forEach((b) => {
      switch (b) {
        case "search":
          this.searchVisible = true;
          break;
        case "preview":
          this.previewVisible = true;
          break;
        case "copy":
          this.copyVisible = true;
      }

      // b.onclick = () => {
      //   this.sendMessage(
      //     b.getAttribute("data-action") || "unknown-action",
      //     text
      //   );
      //   this.hideAll();
      // };
    });
  }

  sendMessage(action: string, data: any) {
    window.postMessage(
      { application: "better-previews", action: action, data: data },
      window.location.origin,
    );
    // chrome.runtime.sendMessage won't put because angular is executed in page context.
    // broadcast.postMessage is not ideal because multiple tabs of same origin get it.
  }

  // It should be a no-op to call this multiple times.
  showContainer(boundingRect: DOMRect): void {
    // Make container visible.
    this.tooltipVisible = false;

    // Ensure it's not covered by other page UI.
    const getMaxZIndex = () => {
      return new Promise((resolve: (arg0: number) => void) => {
        const z = Math.max(
          ...Array.from(document.querySelectorAll("body *"), (el) =>
            parseFloat(window.getComputedStyle(el).zIndex),
          ).filter((zIndex) => !Number.isNaN(zIndex)),
          0,
        );
        resolve(z);
      });
    };

    // We cannot pass boundRect directly as the library treats it as an HTMLElement.
    const virtualEl = {
      getBoundingClientRect() {
        return {
          width: boundingRect.width,
          height: boundingRect.height,
          x: boundingRect.x,
          y: boundingRect.y,
          top: boundingRect.top,
          left: boundingRect.left,
          right: boundingRect.right,
          bottom: boundingRect.bottom,
        };
      },
    };
    // return;

    // Position over reference element
    computePosition(virtualEl, this, {
      placement: "top",
      strategy: "absolute", // If you use "fixed", x, y would change to clientX/Y.
      middleware: [
        offset(12), // Space between mouse and tooltip.
        flip(),
        shift({ padding: 5 }), // Space from the edge of the browser.
        // arrow({ element: this.tooltipArrow }),
      ],
    }).then(({ x, y, placement, middlewareData }) => {
      /*
       * screenX/Y - relative to physical screen.
       * clientX/Y - relative to browser viewport. Use with position:fixed.
       * pageX/Y - relative to page. Use this with position:absolute.
       */
      Object.assign(this.style, {
        top: `${y}px`,
        left: `${x}px`,
      });

      // Handle arrow placement.
      const coords = middlewareData.arrow;

      let staticSide = "bottom";
      switch (placement.split("-")[0]) {
        case "top":
          staticSide = "bottom";
          break;
        case "left":
          staticSide = "right";
          break;
        case "bottom":
          staticSide = "top";
          break;
        case "right":
          staticSide = "left";
          break;
      }
      // Object.assign(this.tooltipArrow.style, {
      //   left: coords?.x != null ? `${coords.x}px` : "",
      //   top: coords?.y != null ? `${coords.y}px` : "",
      //   right: "",
      //   bottom: "",
      //   [staticSide]: "-4px", // If you update this, update height and width of arrow.
      // });

      getMaxZIndex().then((maxZ: number) => {
        this.style.zIndex = "" + (maxZ + 10);
        // this.tooltipArrow.style.zIndex = "" + (maxZ - 1);
      });
    });
  }

  hideAll(): void {
    clearTimeout(this.showTimeout);
    this.tooltipVisible = false;
    this.copyVisible = false;
    this.previewVisible = false;
    this.searchVisible = false;
  }

  inIframe() {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }
}
