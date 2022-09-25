import { StorageProvider } from './storage-provider';

/** Wrapper for chrome.storage.sync. */
export class ChromeStorageProvider implements StorageProvider {
  storageService!: chrome.storage.SyncStorageArea;
  constructor() {
    this.storageService = chrome.storage.sync;
  }
  put(key: string, value: any): Promise<void> {
    if (!value) {
      return Promise.reject('Attempting to save a null value');
    }

    const data: any = {};
    data[key] = value;
    return this.storageService.set(data);
  }

  async get(key: string): Promise<any> {
    const response = await this.storageService.get(key);
    return response[key];
  }

  getAll(): Promise<any> {
    return this.storageService.get(null);
  }
}
