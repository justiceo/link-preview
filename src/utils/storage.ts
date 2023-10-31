/* A light wrapper around chrome storage API. */
export const FEEDBACK_DATA_KEY = "feedback_data";
export const INSTALL_TIME_MS = "install_time_ms";
export const SUCCESSFUL_INTERACTIONS = "successful_interactions";
class Storage {
  storageService: chrome.storage.SyncStorageArea;
  constructor() {
    // Works like chrome.storage.local if syncing is disabled. Max holding of 100Kb.
    this.storageService = chrome.storage.sync;
  }

  // Puts arbitrary value in map for key, overwriting any existing value.
  put(key: string, value: any): Promise<void> {
    if (!value) {
      return Promise.reject("Attempting to save a null value");
    }

    if (!key) {
      return Promise.reject("Attempting to use a null key");
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

  async getAndUpdate(key: string, updateFn): Promise<void> {
    const data = await this.get(key);
    return this.put(key, updateFn(data));
  }
}
export default new Storage();