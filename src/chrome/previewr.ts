
// This class is responsible to loading/reloading/unloading the angular app into the UI.
export class Previewr {
    getExtensionUrl = chrome.runtime.getURL;

    /* This function inserts an Angular custom element (web component) into the DOM. */
    insertPageLoader() {
        if (this.inIframe()) {
            console.log("Not inserting page-loader in iframe");
            return;
        }

        const stylesheets = `
    <link href="${this.getExtensionUrl('content-style.css')}" rel="stylesheet">
  `;
        const styleRange = document.createRange();
        styleRange.selectNode(document.getElementsByTagName('body').item(0)!);
        const styleFragment = styleRange.createContextualFragment(stylesheets);
        document.body.appendChild(styleFragment);

        const tagString = `
    <sp-iframer></sp-iframer>
    <link href="${this.getExtensionUrl('styles.css')}" rel="stylesheet">
    <script src="${this.getExtensionUrl('runtime.js')}"></script>
    <script src="${this.getExtensionUrl('polyfills.js')}"></script>
    <script src="${this.getExtensionUrl('vendor.js')}"></script>
    <script src="${this.getExtensionUrl('main.js')}"></script>
  
   `;
        const range = document.createRange();
        range.selectNode(document.getElementsByTagName('body').item(0)!);
        const documentFragment = range.createContextualFragment(tagString);
        const audateWrapper = document.createElement('div');
        audateWrapper.id = 'audate-preview-container';
        const shadow = audateWrapper.attachShadow({ mode: 'open' });
        shadow.appendChild(documentFragment);
        document.body.appendChild(audateWrapper);
    }

    /*
     * Returns true if this script is running inside an iframe,
     * since the content script is added to all frames.
     */
    inIframe() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }
}