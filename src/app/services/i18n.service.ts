import { Injectable } from '@angular/core';
import { Logger } from '../../shared/logging/logger';
import { LoggingService } from './logging/logging.service';

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  i18n: any[] = [];
  logger: Logger;

  constructor(loggingService: LoggingService) {
    this.logger = loggingService.getLogger('i18n.service');
  }

  getString(key: string): string {
    if (chrome?.i18n) {
      return chrome.i18n.getMessage(key);
    }
    this.logger.error('chrome.i18n is not available in the current context');
    // TODO: Consider loading and caching i18n strings if the chrome.i18n is not available during init.
    return '';
  }
}
