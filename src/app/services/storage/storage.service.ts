import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ChromeStorageProvider } from './chrome-storage-provider';
import { LocalStorageProvider } from './local-storage-provider';
import { StorageProvider } from './storage-provider';

/**
 * Provides abstraction over different storage mechanisms and contexts for the app.
 *
 * TODO: Consider using https://github.com/fregante/webext-detect-page/blob/main/index.ts
 * to determine the current page context.
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService implements StorageProvider {
  storageProvider: StorageProvider;
  constructor(private router: Router) {
    if (chrome?.storage) {
      this.storageProvider = new ChromeStorageProvider();
    } else {
      this.storageProvider = new LocalStorageProvider();
    }
  }

  put(key: string, value: any): Promise<void> {
    return this.storageProvider.put(key, value);
  }
  get(key: string): Promise<any> {
    return this.storageProvider.get(key);
  }
  getAll(): Promise<any> {
    return this.storageProvider.getAll();
  }
}
