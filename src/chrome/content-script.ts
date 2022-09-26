import { computePosition } from '@floating-ui/dom';
import { Message } from 'src/shared/message';
import { LoggingService } from './logging-service';

class ContentScript {
  channel = new BroadcastChannel('audate_link_preview');
  floatie = document.createElement('div');
  getExtensionUrl = chrome.runtime.getURL;
  logger = new LoggingService().getLogger('content-script');

  /* This function inserts an Angular custom element (web component) into the DOM. */
  insertPageLoader(url: string) {
    if (this.inIframe()) {
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
    <sp-page-loader url="${url}"></sp-page-loader>
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

  addSearchButton(
    reference: any,
    floating: HTMLElement,
    ev: MouseEvent | KeyboardEvent,
    selectedText: string
  ) {
    floating.setAttribute('alt', 'Search for ' + selectedText);
    floating.style.display = 'block';
    floating.onclick = (unusedClick) => {
      this.displayPreview('https://example.com');
    };
    this.getMaxZIndex().then((maxZ: number) => {
      floating.style.zIndex = '' + (maxZ + 10);
    });
    computePosition(reference, floating, {
      // Try changing this to a different side.
      placement: 'top',
    }).then((unusedRefs) => {
      // TODO: Fix keyboardEvent not working.
      let x = ev instanceof MouseEvent ? ev.pageX : ev.view!.pageXOffset;
      x = x - 20;
      let y = ev instanceof MouseEvent ? ev.pageY : ev.view!.pageYOffset!;
      y = y - 55;
      Object.assign(floating.style, {
        top: `${y}px`,
        left: `${x}px`,
      });
    });
  }

  getMaxZIndex() {
    return new Promise((resolve: (arg0: number) => void) => {
      const z = Math.max(
        ...Array.from(document.querySelectorAll('body *'), (el) =>
          parseFloat(window.getComputedStyle(el).zIndex)
        ).filter((zIndex) => !Number.isNaN(zIndex)),
        0
      );
      resolve(z);
    });
  }

  maybeSuggestSearch(ev: MouseEvent | KeyboardEvent, floating: HTMLElement) {
    // Ensure button is hidden by default.
    floating.style.display = 'none';

    if (typeof window.getSelection == 'undefined') {
      return;
    }
    const selection = window.getSelection()!;
    if (selection.isCollapsed) {
      return;
    }
    if (this.getLinkTarget(ev)) {
      // TODO: Add preview button instead of search button.
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length == 0 || selectedText.length > 100) {
      return;
    }

    // TODO: Show the copy button instead. (See opera).

    if (this.validateEmail(selectedText)) {
      return;
    }
    if (!this.hasLetters(selectedText)) {
      return;
    }
    if (!isNaN(Date.parse(selectedText))) {
      return;
    }

    this.logger.debug('Selected: ', selectedText);
    this.addSearchButton(
      window.getSelection()!.focusNode!.parentElement,
      floating,
      ev,
      window.getSelection()!.toString()
    );
  }

  setUpVoiceSearchListener() {
    const onMessage = (
      message: Message,
      sender: chrome.runtime.MessageSender,
      callback: (response?: any) => void
    ) => {
      this.logger.log(
        'Received voice search message: ',
        message,
        ' from: ',
        sender
      );
      // TODO Ensure sender.id is this extension. Confirm works for content-script.
      if (message.key == 'voice_search_query') {
        this.displayPreview(message.value);
        callback();
      }

      if (message.key === 'ping') {
        callback('pong');
      }
    };
    chrome.runtime.onMessage.addListener(onMessage);
  }

  redirectLinks() {
    // If the <a> element contains other elements, we traverse the tree to find the anchor element clicked:
    document.body.addEventListener(
      'click',
      (e) => {
        var targetEl: any = this.getLinkTarget(e);
        if (targetEl) {
          // TODO: Publish this event to the containing document, which can reset the iframe src.
          this.logger.log('Click on link detected inside iframe', targetEl);
          targetEl.target = '_parent';
        }
      },
      true
    );
  }

  displayPreview(url: string) {
    if (document.getElementById('audate-preview-container')) {
      this.logger.debug('broadcasting the url');
      this.channel.postMessage(url);
    } else {
      this.logger.debug('inserting audate preview');
      this.insertPageLoader(url);
    }
  }

  // Returns a truthy value (the link element) if event target is a link.
  getLinkTarget(e: MouseEvent | KeyboardEvent): EventTarget | null {
    var target: any = e.target;
    do {
      if (target.nodeName.toUpperCase() === 'A' && target.href) {
        return target;
      }
    } while ((target = target.parentElement));
    return null;
  }

  validateEmail(email: string) {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  }

  hasLetters(str: string) {
    return /[a-zA-Z]/.test(str);
  }

  init() {
    this.floatie.className = 'audate-floatie';
    this.floatie.setAttribute('role', 'img');
    this.floatie.setAttribute('alt', 'Search for selected text');
    this.floatie.setAttribute('tabindex', '0');
    this.floatie.style.backgroundImage = `url(${this.getExtensionUrl(
      'assets/icons/search-icon.jpeg'
    )})`;

    if (this.inIframe()) {
      this.redirectLinks();
      return;
    }

    // TODO: Hide this at first.
    document.body.appendChild(this.floatie);

    // Listen for all mouse/key up events and suggest search if there's a selection.
    document.onmouseup = (e) => this.maybeSuggestSearch(e, this.floatie);
    document.onkeyup = (e) => this.maybeSuggestSearch(e, this.floatie);

    window.addEventListener(
      'resize',
      (unusedEvent) => {
        this.floatie.style.display = 'none';
      },
      true
    );

    /*
     * Listen for voice search from popup.
     * setUpVoiceSearchListener();
     */
  }
}
new ContentScript().init();
