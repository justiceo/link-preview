// This script generates translated versions of an original locale for i18n purposes.
// To run: node translateMessages.js
const fs = require("fs");
const path = require("path");
const translate = require("google-translate-api-x");

const localesDir = "src/_locales";
const sourceLocale = "en";
const localeFilename = "messages.json";

// See full list of supported locales here - https://developer.chrome.com/docs/webstore/i18n/#choosing-locales-to-support
// The following locales are currently omitted: fil.
// The locales pt-BR and pt-PT are reduced to pt.
const targetLocales = [
  "ar",
  "am",
  "bg",
  "bn",
  "ca",
  "cs",
  "da",
  "de",
  "el",
  "en",
  "es",
  "et",
  "fa",
  "fi",
  "fr",
  "gu",
  "he",
  "hi",
  "hr",
  "hu",
  "id",
  "it",
  "ja",
  "kn",
  "ko",
  "lt",
  "lv",
  "ml",
  "mr",
  "ms",
  "ml",
  "no",
  "pl",
  "pt",
  "ro",
  "ru",
  "sk",
  "sl",
  "sr",
  "sv",
  "sw",
  "ta",
  "te",
  "th",
  "tr",
  "uk",
  "vi",
  "zh-CN",
  "zh-TW",
];

const getLocaleFile = (locale) => `${localesDir}/${locale.replace("-", "_")}/${localeFilename}`;

// Reads the contents of source locale file into a variable.
let rawdata = fs.readFileSync(getLocaleFile(sourceLocale));
const sourceLocaleData = JSON.parse(rawdata);
console.log("Successfully parsed ", getLocaleFile(sourceLocale));

// Create a sliced version of the locale messages for batch translation requests.
// We use object input for batch request and get object responses.
const messageRequest = {};
const messageKeys = Object.keys(sourceLocaleData);
messageKeys.forEach((key) => {
  messageRequest[key] = sourceLocaleData[key]["message"];
});
console.log("Created messageRequest", messageRequest);

// Use messageRequest request to generate translation for each targetLocale
let futures = [];
function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}
function applyTranslation(targetLocale, localeData) {
  // Make a copy of masterJson and apply the translation to it.
  const targetLocaleClone = structuredClone(sourceLocaleData);
  messageKeys.forEach((key) => {
    targetLocaleClone[key]["message"] = localeData[key]["text"];
  });

  // Save the new locale to a file.
  ensureDirectoryExistence(getLocaleFile(targetLocale));
  const formattedData = JSON.stringify(targetLocaleClone, null, 4);
  console.log(getLocaleFile(targetLocale), ":\n", formattedData, "\n");
  fs.writeFileSync(getLocaleFile(targetLocale), formattedData, {
    flag: "w",
    overwrite: true,
  });
}
targetLocales.forEach((targetLocale) => {
  const translateFuture = translate(messageRequest, {
    from: sourceLocale,
    to: targetLocale,
  }).then(
    (res) => applyTranslation(targetLocale, res),
    (err) => console.error("Error fetching translation", err)
  );
  futures.push(translateFuture);
});

// Wait for all translate tasks to complete and log status.
Promise.all(futures).then(
  () => console.log("All translate futures have resolved"),
  (err) => console.error("Some futures failed: ", err)
);
