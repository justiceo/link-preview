import { Logger } from "./logger";
import * as enMessage from "../_locales/en/messages.json";

export const logger = new Logger("i18n"); // exported for testing.

// Encode the string to be used as a key in the messages.json file.
// If this function is modified, the same function in tools/translatemessages.js should be modified as well.
function encodeString(input) {
  // Define the allowed characters: a-z, A-Z, 0-9, and _
  const allowedCharacters = /^[a-zA-Z0-9_]+$/;

  // Split the input into an array of characters, transform each character,
  // and then join the array back into a string
  return input
    .split("")
    .map((char) => {
      // If the character matches the allowed characters, return it as is;
      // otherwise, return '_'
      return allowedCharacters.test(char) ? char : "_";
    })
    .join("");
}
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
    return key;
  }

  // Map the plain string to the key used in the messages.json file
  key = key.startsWith("@") ? key : encodeString(key);

  // chrome.i18n may not be available in page context and returns "" for missing keys.
  if (chrome?.i18n && chrome.i18n.getMessage(key) !== "") {
    return chrome.i18n.getMessage(key);
  }
  logger.warn(
    "chrome.i18n is not available in the current context, falling back to en-US",
  );

  Object.keys(enMessage).forEach((k) => {});
  for (const [translationKey, translatedText] of Object.entries(enMessage)) {
    if (translationKey === key) {
      return translatedText["message"];
    }
  }

  logger.error("No translation available for key:", key);
  return key;
};
