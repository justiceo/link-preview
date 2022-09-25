/* eslint-disable no-console */
/* eslint-disable require-jsdoc */
/**
 * Simple util for logging to console.
 *
 * Ensure output level is set to 'verbose' to see debug logs.
 */
export interface Logger {
  debug(...logs: unknown[]): void;
  log(...logs: unknown[]): void;
  warn(...logs: unknown[]): void;
  error(...logs: unknown[]): void;
}
