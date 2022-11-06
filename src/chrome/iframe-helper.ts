// This script is executed inside the preview (i.e. document is iframe).
export class IFrameHelper {
    constructor() {
        /*
         * Favicon URL request, Window.Title request, apply custom CSS.
         * Redirect clicks.
         */

    }

    registerListeners() {
        if (!this.inIframe()) {
            return;
        }
        document.addEventListener(
            'click',
            (e) => {
                var targetEl: any = this.getLinkTarget(e);
                if (targetEl && targetEl.href) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    console.debug("Prevented click propagation and posting navigate");
                    // TODO: Add target origin instead of "*". https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
                    this.sendMessage({
                        action: 'navigate',
                        href: targetEl.href,
                        source: window.location.href,
                        sourceFrame: this.getFrameName(),
                    });
                }
            },
            true
        );

        window.addEventListener('load', () => {
            this.sendMessage({
                action: 'load',
                href: document.location.href,
                sourceFrame: this.getFrameName(),
            })
        });

        window.addEventListener('unload', () => {
            this.sendMessage({
                action: 'unload',
                href: document.location.href,
                sourceFrame: this.getFrameName(),
            })
        });

        addEventListener('readystatechange', (e) => {
            switch (document.readyState) {
                case 'loading':
                    this.sendMessage({
                        action: 'loading',
                        href: document.location.href,
                        sourceFrame: this.getFrameName(),
                    });
            }
        });
    }

    inIframe() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    getFrameName() {
        return window.name;
    }

    // Returns a truthy value (the link element) if event target is a link.
    getLinkTarget(e: MouseEvent | KeyboardEvent): EventTarget | null {
        var target: any = e.target;
        // If the <a> element contains other elements, we traverse the tree to find the anchor element clicked:
        do {
            if (target.nodeName.toUpperCase() === 'A' && target.href) {
                return target;
            }
        } while ((target = target.parentElement));
        return null;
    }

    sendMessage(message: any) {
        console.debug("#sendMessage", message);
        chrome.runtime.sendMessage(message);
    }
}