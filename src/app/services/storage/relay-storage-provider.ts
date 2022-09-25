import { environment } from 'src/environments/environment';
import { StorageProvider } from '../../../shared/storage-provider';
import { StorageMessage } from '../../../shared/storage-message';

export class RelayStorageProvider implements StorageProvider {
  put(key: string, value: any): Promise<void> {
    return this.sendMessage({
      key: key,
      value: value,
      type: 'save',
    });
  }

  get(key: string): Promise<any> {
    return this.sendMessage({
      key: key,
      type: 'read',
    });
  }

  getAll(): Promise<any> {
    return this.sendMessage({
      key: null,
      type: 'read_all',
    });
  }

  // A promise-wrapper around chrome.runtime.sendMessage.
  sendMessage(message: StorageMessage): Promise<any> {
    if (!chrome?.runtime?.sendMessage) {
      return Promise.reject('Invalid context');
    }
    let resolve: any, reject: any;
    const promise = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
    chrome.runtime.sendMessage(message, (response) => {
      // Handle platform errors.
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
        return;
      }

      // Handle application-level errors.
      if (response instanceof Error) {
        reject(response.message);
        return;
      }

      resolve(response);
    });
    return promise;
  }
}
