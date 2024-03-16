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

// Function to get the path to a locale file
function getLocaleFile(locale) {
  return `${localesDir}/${locale.replace("-", "_")}/${localeFilename}`;
}

// Function to read and parse the source locale data
function readSourceLocaleData() {
  const rawdata = fs.readFileSync(getLocaleFile(sourceLocale));
  console.log("Successfully parsed ", getLocaleFile(sourceLocale));
  return JSON.parse(rawdata);
}

// Function to ensure directory existence
function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

// Function to apply translation to locale data and save it
function applyTranslation(targetLocale, localeData, sourceLocaleData) {
  const targetLocaleClone = structuredClone(sourceLocaleData);
  Object.keys(localeData).forEach((key) => {
    targetLocaleClone[key]["message"] = localeData[key]["text"];
  });

  ensureDirectoryExistence(getLocaleFile(targetLocale));
  const formattedData = JSON.stringify(targetLocaleClone, null, 4);
  console.log(getLocaleFile(targetLocale), ":\n", formattedData, "\n");
  fs.writeFileSync(getLocaleFile(targetLocale), formattedData, { flag: "w" });
}

// Main function to generate translations
async function generateTranslations() {
  const sourceLocaleData = readSourceLocaleData();
  const messageRequest = Object.keys(sourceLocaleData).reduce((acc, key) => {
    acc[key] = sourceLocaleData[key]["message"];
    return acc;
  }, {});

  console.log("Created messageRequest", messageRequest);

  try {
    await Promise.all(
      targetLocales.map(async (targetLocale) => {
        if (targetLocale === sourceLocale) return;

        const res = await translate(messageRequest, {
          from: sourceLocale,
          to: targetLocale,
        });
        applyTranslation(targetLocale, res, sourceLocaleData);
      }),
    );

    console.log("All translate futures have resolved");
  } catch (err) {
    console.error("Some futures failed: ", err);
  }
}

// Invoke the main function
generateTranslations();
