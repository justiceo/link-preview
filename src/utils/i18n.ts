import { Logger } from "./logger";
import * as enMessage from "../_locales/en/messages.json";

const logger = new Logger("i18n");

/**
 * Gets the localized string for the specific message.
 * Use en-US as fallback when chrome.i18n is not available.
 *
 * @param key The name of the message as specified in messages.json file.
 * @returns The translated value in browser locale (or en-US outside chrome context).
 */
export const i18n = (key: string): string => {
  if (!key) {
    logger.error("A valid key is required for i18n, got", key);
  }

  if (chrome?.i18n) {
    return chrome.i18n.getMessage(key);
  }
  logger.warn(
    "chrome.i18n is not available in the current context, falling back to en-US"
  );

  Object.keys(enMessage).forEach((k) => {});
  for (const [translationKey, translatedText] of Object.entries(enMessage)) {
    if (translationKey === key) {
      return translatedText["message"];
    }
  }

  logger.error("No translation available for key", key);
  return key;
};
