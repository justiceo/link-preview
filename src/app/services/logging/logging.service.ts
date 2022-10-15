import { Injectable, isDevMode } from '@angular/core';
import { Logger } from './logger';
import { ConsoleLogger } from './console-logger';
import { RemoteLogger } from './remote-logger';

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
