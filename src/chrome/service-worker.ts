import { StorageMessage } from 'src/app/services/storage/storage-message';
import { ChromeStorageProvider } from '../app/services/storage/chrome-storage-provider';
import { ContextMenu } from './context-menu';

new ContextMenu().init();

const uninstallUrl = 'https://forms.gle/PdZ9U61QawXSa4qH8';
const welcomeUrl = chrome.runtime.getURL('index.html#request-permissions');

const onInstalled = (details: chrome.runtime.InstalledDetails) => {
  // On fresh install, open page how to use extension.
  if (details.reason === 'install') {
    chrome.tabs.create({
      url: welcomeUrl,
      active: true,
    });
  }

  /*
   * For updates, show the onboarding again for in-active users.
   * TODO: Implement isActive.
   */
  const isActive = true;
  if (details.reason === 'update' && !isActive) {
    chrome.tabs.create({
      url: welcomeUrl,
      active: true,
    });
  }

  // Set url to take users upon uninstall.
  chrome.runtime.setUninstallURL(uninstallUrl, () => {
    if (chrome.runtime.lastError) {
      console.error('Error setting uninstall URL', chrome.runtime.lastError);
    }
  });
};
chrome.runtime.onInstalled.addListener(onInstalled);

const storageProvider = new ChromeStorageProvider();
const onMessage = (
  message: any,
  sender: chrome.runtime.MessageSender,
  callback: (response?: any) => void
) => {
  console.log('Received message: ', message, ' from: ', sender);

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

  // TODO Ensure sender.id is this extension. Confirm works for content-script.
  switch (message.type) {
    case 'save':
      storageProvider.put(message.key!, /* canDefer=*/ message.value).then(
        (response) => callback(response),
        (errorReason) => callback(new Error(errorReason))
      );
      break;
    case 'read':
      storageProvider.get(message.key!).then(
        (value) => callback(value),
        (errorReason) => callback(new Error(errorReason))
      );
      break;
    case 'read_all':
      storageProvider.getAll().then(
        (response) => callback(response),
        (errorReason) => callback(new Error(errorReason))
      );
      break;
    default:
      callback(new Error('Undefined message type: ' + message.type));
      break;
  }
};

chrome.runtime.onMessage.addListener(onMessage);
