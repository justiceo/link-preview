import { arrow, computePosition, flip, offset, shift } from '@floating-ui/dom';
import "./floatie.css";

/*
 * This component is responsible for rendering 
 * the floatie and managing its lifecycle.
 * The floatie is rendered in a shadow dom to
 * avoid interference from parent document.
 */
export class Floatie {
    channel = new BroadcastChannel('floatie_broadcast');
    container: HTMLElement;
    copyButton: HTMLElement;
    searchButton: HTMLElement;
    previewButton: HTMLElement;
    tooltipArrow: HTMLElement;

    constructor() {
        const markup = `
        <div id="sp-floatie-container">
            <div id="sp-floatie-arrow"></div>
            <div id="sp-floatie-search" class="sp-floatie-action" data-action="search">Search</div>
            <div id="sp-floatie-preview" class="sp-floatie-action" data-action="preview">Preview</div>
            <div id="sp-floatie-copy" class="sp-floatie-action" data-action="copy">Copy</div>
        </div>
        `
        // Parse markup.
        const range = document.createRange();
        range.selectNode(document.getElementsByTagName('body').item(0)!);
        const documentFragment = range.createContextualFragment(markup);

        // Extract actions buttons.
        const container = documentFragment.getElementById("sp-floatie-container");
        const searchButton = documentFragment.getElementById("sp-floatie-search");
        const previewButton = documentFragment.getElementById("sp-floatie-preview");
        const copyButton = documentFragment.getElementById("sp-floatie-copy");
        const tooltipArrow = documentFragment.getElementById("sp-floatie-arrow");
        if (!container || !searchButton || !previewButton || !copyButton || !tooltipArrow) {
            throw new Error("Impossible error obtaining action buttons from DOM");
        }
        this.container = container;
        this.searchButton = searchButton;
        this.previewButton = previewButton;
        this.copyButton = copyButton;
        this.tooltipArrow = tooltipArrow;

        document.body.appendChild(documentFragment);

        // Register event listeners on UI elements.
        this.registerListeners();

        console.debug("Initialized floatie");
    }

    registerListeners(): void {
        // Window level events.
        window.onscroll = () => this.hideAll();
        window.onresize = () => this.hideAll();

        // Listen for mouse up events and suggest search if there's a selection.
        document.onmouseup = (e) => this.maybeShow(e);
    }

    unregisterListeners(): void {
        document.removeEventListener('onmouseup', (e) => { });
        window.removeEventListener('onscroll', (e) => { });
        window.removeEventListener('onresize', (e) => { });
    }

    maybeShow(e: MouseEvent): void {
        // Ensure button is hidden by default.
        this.hideAll();

        // Filter out empty/irrelevant selections.
        if (typeof window.getSelection == 'undefined') {
            return;
        }
        const selection = window.getSelection()!;
        if (selection.isCollapsed) {
            return;
        }

        // Show appropriate buttons.
        const selectedText = selection.toString().trim();
        console.debug("Selected: ", selectedText);
        if (this.shouldShowPreview(e, selectedText)) {
            this.showActions(e, selectedText, [this.previewButton, this.copyButton])
        } else if (this.shouldShowSearch(e, selectedText)) {
            this.showActions(e, selectedText, [this.searchButton, this.copyButton])
        } else if (this.shouldShowCopy(selectedText)) {
            this.showActions(e, selectedText, [this.copyButton]);
        }
    }

    shouldShowCopy(selectedText: string): boolean {
        return selectedText.length > 0;
    }

    shouldShowPreview(e: MouseEvent | KeyboardEvent, selectedText: string): boolean {
        const isUrl = (text: string) => {
            try {
                const unused = new URL(text);
                return true;
            } catch (_) {
                return false;
            }
        };

        const isHyperlink = (e: MouseEvent | KeyboardEvent) => {
            var target: any = e.target;
            do {
                if (target.nodeName.toUpperCase() === 'A' && target.href) {
                    return true;
                }
            } while ((target = target.parentElement));
            return false;
        }

        return isUrl(selectedText) || isHyperlink(e);
    }

    shouldShowSearch(e: MouseEvent, selectedText: string): boolean {
        const isQuerySize = (text: string) => {
            return text.length > 0 && text.length < 100;
        }

        const isEmail = (email: string) => {
            return String(email)
                .toLowerCase()
                .match(
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                );
        }

        const isDate = (dataStr: string) => {
            return !isNaN(Date.parse(dataStr))
        }

        const hasLetters = (text: string) => {
            return /[a-zA-Z]/.test(text);
        }

        return isQuerySize(selectedText)
            && hasLetters(selectedText)
            && !isEmail(selectedText)
            && !isDate(selectedText)
            && !this.shouldShowPreview(e, selectedText);
    }

    showActions(e: MouseEvent, text: string, buttons: HTMLElement[]) {
        this.showContainer(e);
        buttons.forEach(b => {
            b.style.display = 'inline-block';
            b.onclick = () => {
                this.channel.postMessage({ action: b.getAttribute("data-action"), data: text });
                this.hideAll();
            }
        });
        // buttons[0].eventListeners
    }

    // It should be a no-op to call this multiple times.
    showContainer(ev: MouseEvent): void {
        // Make container visible.
        this.container.style.display = 'block';

        // Ensure it's not covered by other page UI.
        const getMaxZIndex = () => {
            return new Promise((resolve: (arg0: number) => void) => {
                const z = Math.max(
                    ...Array.from(document.querySelectorAll('body *'), (el) =>
                        parseFloat(window.getComputedStyle(el).zIndex)
                    ).filter((zIndex) => !Number.isNaN(zIndex)),
                    0
                );
                resolve(z);
            });
        };

        const virtualEl = {
            getBoundingClientRect() {
              return {
                width: 0,
                height: 0,
                x: ev.clientX,
                y: ev.clientY,
                top: ev.clientY,
                left: ev.clientX,
                right: ev.clientX,
                bottom: ev.clientY,
              };
            },
          };

        // Position over reference element
        computePosition(virtualEl, this.container, {
            placement: "top",
            strategy: 'absolute', // If you use "fixed", x, y would change to clientX/Y.
            middleware: [
                offset(17), // Space between mouse and tooltip.
                flip(), 
                shift({ padding: 5 }), // Space from the edge of the browser.
                arrow({ element: this.tooltipArrow }),],
        }).then(({ x, y, placement, middlewareData }) => {
            /*
             * TODO: Consider using ev.target instead of mouseevent like opera.
             * screenX/Y - relative to physical screen.
             * clientX/Y - relative to browser viewport. Use with position:fixed.
             * pageX/Y - relative to page. Use this with position:absolute.
             */
            Object.assign(this.container.style, {
                top: `${y}px`,
                left: `${x}px`,
            });

            // Handle arrow placement.
            const coords = middlewareData.arrow;
            const staticSide = {
                top: 'bottom',
                right: 'left',
                bottom: 'top',
                left: 'right',
            }[placement.split('-')[0]];
            Object.assign(this.tooltipArrow.style, {
                left: coords?.x != null ? `${coords.x}px` : '',
                top: coords?.y != null ? `${coords.y}px` : '',
                right: '',
                bottom: '',
                [staticSide]: '-4px',
            });

            getMaxZIndex().then((maxZ: number) => {
                this.container.style.zIndex = '' + (maxZ + 10);
                this.tooltipArrow.style.zIndex = '' + (maxZ - 1);
            });
        });
    }

    hideAll(): void {
        this.container.style.display = 'none';
        this.copyButton.style.display = 'none';
        this.searchButton.style.display = 'none';
        this.previewButton.style.display = 'none';
    }
}