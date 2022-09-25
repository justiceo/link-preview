import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  LocaleProperties,
  LocalesForDefaultModel,
  DefaultLocale,
} from 'src/app/services/locale/locale-properties';
import {
  DefaultSearchEngine,
  SearchEngine,
  SearchEngines,
} from 'src/app/model/search-engine';
import { InputDeviceService } from 'src/app/services/input-device.service';
import { LocaleService } from 'src/app/services/locale/locale.service';
import { SearchEngineService } from 'src/app/services/search-engine.service';
import { LoggingService } from 'src/app/services/logging/logging.service';
import { Logger } from 'src/shared/logging/logger';

@Component({
  selector: 'audate-quick-settings',
  templateUrl: './quick-settings.component.html',
  styleUrls: ['./quick-settings.component.scss'],
})
export class QuickSettingsComponent implements OnInit {
  logger: Logger;
  locales: LocaleProperties[] = LocalesForDefaultModel;
  currentLocale: LocaleProperties = DefaultLocale;

  searchEngines: SearchEngine[] = SearchEngines;
  currentSearchEngine: SearchEngine = DefaultSearchEngine;

  inputDevices: MediaDeviceInfo[] = [];
  currentInputDevice?: MediaDeviceInfo;
  NO_DEFAULT_INPUT_DEVICE: MediaDeviceInfo = {
    label: 'No Default Input Device',
    kind: 'audioinput',
    groupId: '',
    deviceId: '',
    toJSON: function () {
      throw new Error('Function not implemented.');
    },
  };

  activeSection: string = 'quick-settings';

  constructor(
    private localeService: LocaleService,
    private searchEngineService: SearchEngineService,
    private inputDeviceService: InputDeviceService,
    private ref: ChangeDetectorRef,
    loggingService: LoggingService
  ) {
    this.logger = loggingService.getLogger('quick-settings');
  }

  ngOnInit(): void {
    this.localeService.getRecognitionLocale().subscribe((locale) => {
      this.currentLocale = locale;
      this.ref.detectChanges();
    });

    this.searchEngineService.getSearchEngine().subscribe((se) => {
      this.currentSearchEngine = se;
      this.ref.detectChanges();
    });

    this.inputDeviceService.getDefaultDevice().then(
      (d) => {
        this.inputDevices.push(d);
        this.currentInputDevice = d;
        this.ref.detectChanges();
      },
      (error) => {
        this.logger.error(error);
        if (!this.currentInputDevice) {
          this.currentInputDevice = this.NO_DEFAULT_INPUT_DEVICE;
        }
      }
    );
  }

  setLocale(locale: LocaleProperties): void {
    this.localeService.setRecognitionLocale(locale);
  }
  setSearchEngine(se: SearchEngine): void {
    this.searchEngineService.setSearchEngine(se);
  }
}
