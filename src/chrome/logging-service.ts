import { environment } from '../environments/environment';
import { ConsoleLogger } from '../shared/logging/console-logger';
import { Logger } from '../shared/logging/logger';
import { RemoteLogger } from '../shared/logging/remote-logger';

export class LoggingService {
  getLogger(tag: string): Logger {
    if (environment.production) {
      return new RemoteLogger();
    } else {
      return new ConsoleLogger(tag);
    }
  }
}
