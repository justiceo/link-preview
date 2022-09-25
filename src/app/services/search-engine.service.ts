import { Injectable } from '@angular/core';
import { Observable, share, Subject } from 'rxjs';
import { DefaultSearchEngine, SearchEngine } from '../model/search-engine';
import { Logger } from '../../shared/logging/logger';
import { LoggingService } from './logging/logging.service';
import { StorageService } from './storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class SearchEngineService {
  logger: Logger;
  currentSearchEngine = DefaultSearchEngine;
  currentSearchEngine$: Subject<SearchEngine> = new Subject();
  // TODO: Make this a setting.
  shouldOpenInNewTab = false;

  constructor(
    private storageService: StorageService,
    loggingService: LoggingService
  ) {
    this.logger = loggingService.getLogger('SearchEngService');

    // Fetch and broadcast saved search engine, set it if not available.
    this.getSavedSearchEngine().then((se) => {
      if (se) {
        this.currentSearchEngine$.next(se);
      } else {
        this.setSearchEngine(DefaultSearchEngine);
      }
    });
    // Update currentSearchEngine everytime search engine changes.
    this.getSearchEngine().subscribe((se) => (this.currentSearchEngine = se));
  }

  getSearchEngine(): Observable<SearchEngine> {
    return this.currentSearchEngine$.asObservable().pipe(share());
  }

  private getSavedSearchEngine(): Promise<SearchEngine> {
    return this.storageService.get('search_engine').then(
      (se: any) => {
        return se as SearchEngine;
      },
      (errorReason) => {
        this.logger.error(
          'Failed to fetch search engine due to error: ',
          errorReason
        );
        this.logger.warn('Using default search engine instead');
        return DefaultSearchEngine;
      }
    );
  }

  setSearchEngine(se: SearchEngine) {
    this.storageService.put('search_engine', se).then(
      () => {
        this.currentSearchEngine$.next(se);
      },
      (error) => {
        this.logger.error(error);
      }
    );
  }

  // TODO: Use default provider: https://developer.chrome.com/docs/extensions/reference/search/
  performSearch(query: string): void {
    const url = this.currentSearchEngine.queryTemplate.replace(
      '%QUERY%',
      query
    );

    if (this.shouldOpenInNewTab) {
      (window as any).open(url, '_blank').focus();
    } else {
      // Open the query as a preview in the current tab.
      this.getActiveTabForPreview().then(
        (activeTab) => {
          chrome.tabs.sendMessage(
            activeTab.id!,
            {
              key: 'voice_search_query',
              value: url,
            },
            () => {
              // Maybe close popup here?
            }
          );
        },
        (error) => {
          this.logger.error(error.message);
          if (error.tabId) {
            chrome.tabs.update(error.tabId, { url: url });
          }
        }
      );
    }
  }

  /** Return a tab if we can display preview in it. Fails otherwise. */
  getActiveTabForPreview(): Promise<chrome.tabs.Tab> {
    return new Promise((resolve, error) => {
      chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
        var activeTab = tabs[0];
        if (!activeTab.id) {
          error({ message: 'Active tab does not have an ID' });
          return;
        }

        // Tab.url may be null if there's a pending navigation.
        if (!activeTab.url && !activeTab.pendingUrl) {
          error({ message: 'On NewTab or HomePage.', tabId: activeTab.id });
          return;
        }

        const timeout = setTimeout(() => {
          error({ message: 'No response from page.', tabId: activeTab.id });
        }, 200);

        chrome.tabs.sendMessage(
          activeTab.id,
          {
            key: 'ping',
          },
          (unusedPong) => {
            clearTimeout(timeout);
            if (chrome.runtime.lastError) {
              error({ message: chrome.runtime.lastError, tabId: activeTab.id });
              return;
            }
            resolve(activeTab);
          }
        );
      });
    });
  }
}
