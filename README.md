#  Search Preview

Cool search and URL previews.

# Message passing

1. Broadcast Channel: For communicating with frames on same origin across different contexts.
- Deficiency: A window can host pages with different origins.
2. Window.postMessage: For communicating with frames of different origins in same window.
- Deficiency: Need to know target origin for cross-origin communication. "*" doesn't work.
3. chrome.runtime.connect: Long-lived connection for extension 
- Deficiency: Port gets disconnected when frame location changes. Managing its connected state is complex.
4. chrome.runtime.sendMessage: One of extension message.