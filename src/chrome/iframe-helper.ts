// This script is executed inside the preview (i.e. document is iframe).
export class IFrameHelper {
    channelName = "iframe-helper";
    channel?: chrome.runtime.Port;
    constructor() {
        if (this.inIframe()) {
            this.channel = chrome.runtime.connect({ name: this.channelName });
        }

        /*
         * Favicon URL request, Window.Title request, apply custom CSS.
         * Redirect clicks.
         */

    }

    getChannelName() {
        return this.channelName;
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

    registerListeners() {
        document.addEventListener(
            'click',
            (e) => {
                console.error(this.getFrameName(), 'click fired')
                var targetEl: any = this.getLinkTarget(e);
                if (targetEl && targetEl.href) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    console.error("Prevented click propagation and posting navigate");
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
            console.error(this.getFrameName(), 'load fired')
            this.sendMessage({
                action: 'load',
                href: document.location.href,
                sourceFrame: this.getFrameName(),
            })
        });

        window.addEventListener('unload', () => {
            console.error(this.getFrameName(), 'unload fired')
            this.sendMessage({
                action: 'unload',
                href: document.location.href,
            })
        });
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
        window.postMessage(message, "*");
        // or.
        this.channel?.postMessage(message);
    }
}