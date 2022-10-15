import { StorageMessage } from 'src/app/services/storage/storage-message';
import { ChromeStorageProvider } from '../app/services/storage/chrome-storage-provider';
import { ContextMenu } from './context-menu';
import { SearchEngine } from 'src/app/model/search-engine';

new ContextMenu().init();

const uninstallUrl = 'https://forms.gle/TuRLnDRFoXRNFuZP7';
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

const messageContentScript = (message: any, callback: any) => {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    var activeTab = tabs[0];
    if (!activeTab.id) {
      console.error('Active tab does not have an ID');
      return;
    }
    chrome.tabs.sendMessage(activeTab.id, message, callback);
  });
};

const storageProvider = new ChromeStorageProvider();
const onMessage = (
  message: StorageMessage,
  sender: chrome.runtime.MessageSender,
  callback: (response?: any) => void
) => {
  console.log('Received message: ', message, ' from: ', sender);
  if (message.key === 'create_search_url_for_query') {
    storageProvider.get('search_engine').then(
      (searchEngine: SearchEngine) => {
        const url = searchEngine.queryTemplate.replace(
          '%QUERY%',
          message.value
        );
        console.log('Encoded search query url: ', url);
        messageContentScript({ key: 'encoded_search_url', value: url }, null);
      },
      (errorReason) => {
        console.error(errorReason);
      }
    );
  }
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
