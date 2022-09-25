import { Injectable, isDevMode } from '@angular/core';
import { Logger } from '../../../shared/logging/logger';
import { ConsoleLogger } from '../../../shared/logging/console-logger';
import { RemoteLogger } from '../../../shared/logging/remote-logger';

@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  getLogger(tag: string): Logger {
    if (isDevMode()) {
      return new ConsoleLogger(tag);
    } else {
      return new RemoteLogger();
    }
  }
}
