import { Logger } from './logger';

export class ConsoleLogger implements Logger {
  tag = '';

  constructor(tag: string) {
    this.tag = tag;
  }

  debug(...logs: unknown[]) {
    const d = new Date(Date.now());
    console.debug(
      '%c%s %s',
      'color: blue',
      `[${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}]`,
      this.tag,
      ...logs
    );
  }

  log(...logs: unknown[]) {
    const d = new Date(Date.now());
    console.log(
      '%c%s %s',
      'color: blue',
      `[${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}]`,
      this.tag,
      ...logs
    );
  }

  warn(...logs: unknown[]) {
    const d = new Date(Date.now());
    console.warn(
      '%c%s %s',
      'color: blue',
      `[${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}]`,
      this.tag,
      ...logs
    );
  }

  error(...logs: unknown[]) {
    const d = new Date(Date.now());
    console.error(
      '%c%s %s',
      'color: blue',
      `[${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}]`,
      this.tag,
      ...logs
    );
  }
}
