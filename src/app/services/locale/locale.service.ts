import { Injectable } from '@angular/core';
import { Observable, share, Subject } from 'rxjs';
import {
  LocaleProperties,
  LocalesForDefaultModel,
  DefaultLocale,
} from './locale-properties';
import { Logger } from '../../../shared/logging/logger';
import { LoggingService } from '../logging/logging.service';
import { StorageService } from '../storage/storage.service';

/**
 * Class for answering locale-related questions
 */
@Injectable({
  providedIn: 'root',
})
export class LocaleService {
  logger: Logger;
  localeSubject$ = new Subject<LocaleProperties>();
  constructor(
    loggingService: LoggingService,
    private storageService: StorageService
  ) {
    this.logger = loggingService.getLogger('LocaleService');

    // Fetch and broadcast saved locale, set it if not available.
    this.getSavedLocale().then((locale) => {
      if (locale) {
        this.localeSubject$.next(locale);
      } else {
        this.setRecognitionLocale(LocaleService.getDefaultLocale());
      }
    });
  }
  /**
   * Update the user locale.
   *
   * @param {string} locale
   */
  setRecognitionLocale(locale: LocaleProperties) {
    this.storageService.put('voice_recognition_locale', locale).then(
      () => {
        this.localeSubject$.next(locale);
      },
      (error) => {
        this.logger.error(error);
      }
    );
  }

  /** Return an observable over locale data. */
  getRecognitionLocale(): Observable<LocaleProperties> {
    return this.localeSubject$.asObservable().pipe(share());
  }

  /**
   * Get the recognition language.
   *
   * If it is not set, set it to default locale.
   * @return {string} a BCP-47 locale.
   */
  private getSavedLocale(): Promise<LocaleProperties> {
    return this.storageService.get('voice_recognition_locale').then(
      (locale: any) => {
        this.logger.log('#getRecognitionLocale() :', locale);
        return locale as LocaleProperties;
      },
      (errorReason) => {
        this.logger.error('Failed to fetch locale due to error: ', errorReason);
        this.logger.warn('Using default locale instead');
        return LocaleService.getDefaultLocale();
      }
    );
  }

  /**
   * Get the locale from the browser.
   *
   * @return {string} a BCP-47 locale.
   */
  static getDefaultLocale(): LocaleProperties {
    let defaultLocale = DefaultLocale;

    /*
     * Navigator.language returns the preferred language of the user for the browser UI.
     * See https://developer.mozilla.org/en-US/docs/Web/API/Navigator/language.
     */
    let navLocale = undefined;
    if (navigator.languages !== undefined) {
      navLocale = LocalesForDefaultModel.find(
        (l: LocaleProperties) => l.bcp_47 == navigator.languages[0]
      );
    } else if (navigator.language) {
      navLocale = LocalesForDefaultModel.find(
        (l: LocaleProperties) => l.bcp_47 == navigator.language
      );
    } else if (chrome?.i18n) {
      const i18nLocale = chrome.i18n.getUILanguage();
      navLocale = LocalesForDefaultModel.find(
        (l: LocaleProperties) => l.bcp_47 == i18nLocale
      );
    }

    if (navLocale) {
      defaultLocale = navLocale;
    }
    return defaultLocale;
  }
}
