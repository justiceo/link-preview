#  Search Preview

Cool search and URL previews.

# Message passing

1. Broadcast Channel: For communicating with frames on same origin across different contexts (and tabs).
- Deficiency: A window can host pages with different origins.
- If multiple tabs of same origin are open in a browser, all tabs receive the broadcast.

2. Window.postMessage: For communicating with frames of different origins in same window.
- Deficiency: Need to know target origin for cross-origin communication. "*" doesn't work.

3. chrome.runtime.connect: Long-lived connection for extension 
- Deficiency: Port gets disconnected when frame location changes. Managing its connected state is complex.
- Deficiency: If part of the content-scripts Js is executed in page context, it would not have access to chrome.runtime.

4. chrome.runtime.sendMessage: Send message from content script to bg and back.
- Deficiency: If part of the content-scripts Js is executed in page context, it would not have access to chrome.runtime.

5. Window custom event: Create and dispatch custom events to the window.

# Domains that bleed CSS into ShadowDOM


- Example.com (floatie looks weird)
- YouTube.com (previewr not showing, angulr framework issue)
- Twitter (previewr csp error)

### Tried

- Using :host reset for font-size, didn't work.
- Using it with `contain: content`, UI is not displayed. https://web.dev/shadowdom-v1/#use-css-containment.