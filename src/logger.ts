/* eslint-disable no-console */
/* eslint-disable require-jsdoc */
/**
 * Simple util for logging to console.
 *
 * Ensure output level is set to 'verbose' to see debug logs.
 */
export class Logger {
  static debugMode = true;

  tag = "";

  constructor(tag: string) {
    this.tag = tag;
  }

  debug(...logs: unknown[]) {
    if (!Logger.debugMode) {
      return;
    }
    const d = new Date(Date.now());
    console.debug(
        "%c%s %s",
        "color: blue",
        `[${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}]`,
        this.tag,
        ...logs,
    );
  }

  log(...logs: unknown[]) {
    if (!Logger.debugMode) {
      return;
    }
    const d = new Date(Date.now());
    console.log(
        "%c%s %s",
        "color: blue",
        `[${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}]`,
        this.tag,
        ...logs,
    );
  }

  warn(...logs: unknown[]) {
    if (!Logger.debugMode) {
      return;
    }
    const d = new Date(Date.now());
    console.warn(
        "%c%s %s",
        "color: blue",
        `[${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}]`,
        this.tag,
        ...logs,
    );
  }

  error(...logs: unknown[]) {
    if (!Logger.debugMode) {
      return;
    }
    const d = new Date(Date.now());
    console.error(
        "%c%s %s",
        "color: blue",
        `[${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}]`,
        this.tag,
        ...logs,
    );
  }
}
