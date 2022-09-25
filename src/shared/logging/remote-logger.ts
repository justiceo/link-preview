import { Logger } from './logger';

// TODO: Implement this: https://github.com/winstonjs/winston
export class RemoteLogger implements Logger {
  debug(...unusedLogs: unknown[]): void {}
  log(...unusedLogs: unknown[]): void {}
  warn(...unusedLogs: unknown[]): void {}
  error(...unusedLogs: unknown[]): void {}
}
