import "./post-install";
import "./context-menus";
import "./icon-updater";
import "./feedback-checker";
import { getOrCreateSessionId } from "./session-id";

// All service-worker messages should go through this function.
const onMessage = (
  message: any,
  sender: chrome.runtime.MessageSender,
  callback: (response?: any) => void
) => {

  // Check if the message is from this extension.
  if (!sender.id || sender.id !== chrome.i18n.getMessage("@@extension_id")) {
    console.warn("Ignoring message from unknown sender", sender);
    return;
  }
  console.log("Received message: ", message, " from: ", sender);

  if (message === "get_or_create_session_id") {
    getOrCreateSessionId().then((sessionId) => {
      console.log("Sending session Id", sessionId);
      callback(sessionId);
    });
    return true; // Important! Return true to indicate you want to send a response asynchronously
  }

  // For now, bounce-back message to the content script.
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length == 0) {
      console.error('Unexpected state: No active tab');
      return;
    }
    chrome.tabs.sendMessage(tabs[0].id!, message, (response) => {
      callback(response);
    });
  });
}

chrome.runtime.onMessage.addListener(onMessage);
