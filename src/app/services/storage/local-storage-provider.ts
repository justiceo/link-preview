import { StorageProvider } from '../../../shared/storage-provider';

/** Fallback storage for development and testing. */
export class LocalStorageProvider implements StorageProvider {
  storageService: Storage;
  constructor() {
    this.storageService = window.localStorage;
  }
  async put(key: string, value: any): Promise<void> {
    if (!value) {
      return Promise.reject('Attempting to save a null value');
    }

    const audate = await this.getAll();
    audate[key] = value;
    this.storageService.setItem('audate', JSON.stringify(audate));
    Promise.resolve();
  }

  async get(key: string): Promise<any> {
    const audate = this.storageService.getItem('audate');
    if (audate == null) {
      return Promise.resolve(null);
    }
    return Promise.resolve(JSON.parse(audate)[key]);
  }

  getAll(): Promise<any> {
    const audate = this.storageService.getItem('audate');
    if (audate == null) {
      return Promise.resolve(null);
    }
    return Promise.resolve(JSON.parse(audate));
  }
}
