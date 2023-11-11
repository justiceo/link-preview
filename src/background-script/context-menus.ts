import Analytics from "../utils/analytics";
import { Logger } from "../utils/logger";
import Storage from "../utils/storage";
/*
 * Set up context menu (right-click menu) for different conexts.
 * See reference https://developer.chrome.com/docs/extensions/reference/contextMenus/#method-create.
 * Max number of browser_action menu items: 6 - https://developer.chrome.com/docs/extensions/reference/contextMenus/#property-ACTION_MENU_TOP_LEVEL_LIMIT
 */
interface MenuItem {
  menu: chrome.contextMenus.CreateProperties;
  handler: (
    info: chrome.contextMenus.OnClickData,
    tab?: chrome.tabs.Tab
  ) => void;
}

/*
 * Prefer arrow method names here -
 * https://www.typescriptlang.org/docs/handbook/2/classes.html#arrow-functions.
 */
declare var IS_DEV_BUILD: boolean;
export class ContextMenu {
  logger = new Logger(this);
  
  RELOAD_ACTION: MenuItem = {
    menu: {
      id: "reload-extension",
      title: "Reload Extension",
      visible: true,
      contexts: ["action"],
    },
    handler: (unusedInfo) => {
      chrome.runtime.reload();
    },
  };
  CLEAR_STORAGE: MenuItem = {
    menu: {
      id: 'clear-storage',
      title: 'Clear Storage',
      visible: true,
      contexts: ['action'],
    },
    handler: (unusedInfo) => {
      chrome.storage.sync.clear();
      chrome.storage.local.clear();
    },
  };

  PRINT_STORAGE: MenuItem = {
    menu: {
      id: 'print-storage',
      title: 'Print Storage',
      visible: true,
      contexts: ['action'],
    },
    handler: async (unusedInfo) => {
      this.logger.log("Storage contents:", await Storage.getAll())
    },
  };

  PREVIEW_ACTION: MenuItem = {
    menu: {
      id: 'show-preview',
      title: 'Preview Link',
      visible: true,
      contexts: ['link'],
    },
    handler: (data: chrome.contextMenus.OnClickData) => {
      if (!data.linkUrl) {
        console.warn('No linkurl', data);
        return;
      }
      this.sendMessage({ action: 'preview', data: data.linkUrl });
    },
  };

  SEARCH_ACTION: MenuItem = {
    menu: {
      id: 'show-search',
      title: 'Preview Search Results',
      visible: true,
      contexts: ['selection'],
    },
    handler: (data: chrome.contextMenus.OnClickData) => {
      if (!data.selectionText) {
        console.warn('No selection', data);
        return;
      }
      this.sendMessage({ action: 'search', data: data.selectionText });
    },
  };


  browserActionContextMenu: MenuItem[] = [
    this.PREVIEW_ACTION,
    this.SEARCH_ACTION,
  ];

  init = () => {
    // Maybe add dev-only actions.
    if(IS_DEV_BUILD) {
      this.browserActionContextMenu.push(this.RELOAD_ACTION, this.CLEAR_STORAGE, this.PRINT_STORAGE);
    }

    // Check if we can access context menus.
    if (!chrome || !chrome.contextMenus) {
      console.warn("No access to chrome.contextMenus");
      return;
    }

    // Clear the menu.
    chrome.contextMenus.removeAll();
    // Add menu items.
    this.browserActionContextMenu.forEach((item) =>
      chrome.contextMenus.create(item.menu)
    );
    /*
     * When onClick is fired, execute the handler associated
     * with the menu clicked.
     */
    chrome.contextMenus.onClicked.addListener(this.onClick);
  };

  onClick = (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
    const menuItem = this.browserActionContextMenu.find(
      (item) => item.menu.id === info.menuItemId
    );
    if (menuItem) {
      Analytics.fireEvent("context_menu_click", {menu_id: info.menuItemId});
      menuItem.handler(info, tab);
    } else {
      console.error("Unable to find menu item: ", info);
    }
  };

  sendMessage(message: any): void {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id!, message, (response) => {
        console.debug("ack:", response);
      });
    });
  }
}
new ContextMenu().init();
