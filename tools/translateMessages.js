// This script generates translated versions of an original locale for i18n purposes.
// To run: node translateMessages.js
const fs = require("fs");
const path = require("path");
const translate = require("google-translate-api-x");
const { glob } = require("glob");
const { JSDOM } = require("jsdom");

const srcDir = "src";
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
    if (
      localeData[key].from?.language?.didYouMean &&
      localeData[key].from.language.iso !== sourceLocale
    ) {
      console.warn(
        `Auto corrected source locale from ${sourceLocale} to ${localeData[key].from.language.iso} `,
      );
    }
    if (
      localeData[key].from?.text?.didYouMean ||
      localeData[key].from?.text?.autoCorrected
    ) {
      console.warn(
        `Auto corrected text to ${localeData[key].from?.text?.value}`,
      );
    }
  });

  ensureDirectoryExistence(getLocaleFile(targetLocale));
  const formattedData = JSON.stringify(targetLocaleClone, null, 4);
  console.log("Updated: ", getLocaleFile(targetLocale));
  fs.writeFileSync(getLocaleFile(targetLocale), formattedData, { flag: "w" });
}

// Function to search and return a matching regex in a file.
function searchInFile(filePath, regex) {
  const content = fs.readFileSync(filePath, "utf8");
  const allMatches = [];
  let matches;

  while ((matches = regex.exec(content)) !== null) {
    // This will push the first captured group (the content inside quotes) into allMatches
    if (matches[1]) {
      allMatches.push(matches[1]);
    }
  }

  return allMatches;
}

// Loops through .ts and .js files and extracts i18n literals.
function searchForI18nStrings(srcDirectory) {
  return new Promise(async (resolve, reject) => {
    // Regex to capture content inside quotes without including the quotes
    // TODO: Verify it works for new lines (for long texts).
    const regex = /i18n\(\s*(?:"([\s\S]*?)"|'([\s\S]*?)')\s*,?\s*\)/g;
    const filesPattern = path.join(srcDirectory, "**", "*.{ts,js}");
    const files = await glob(filesPattern);

    const allMatches = files.reduce((acc, filePath) => {
      const matches = searchInFile(filePath, regex);
      if (matches.length > 0) {
        acc[filePath] = matches;
      }
      return acc;
    }, {});

    let literals = Object.values(allMatches).reduce(
      (acc, currentValue) => acc.concat(currentValue),
      [],
    );
    literals = literals.filter((f) => !f.startsWith("@")); // exclude special messages.
    resolve(literals);
  });
}

// Map the literals to a valid manifest key.
// If this function is modified, also update it in src/utils/i18n.ts
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

// Maps the literals to an object, where the key is an encoded version of the literal and the value is the literal itself.
function mapLiteralsToEncodedObject(literals) {
  return literals.reduce((acc, literal) => {
    acc[encodeString(literal)] = { message: literal };
    return acc;
  }, {});
}

function parseHTMLFiles(src) {
  return new Promise(async (resolve, reject) => {
    // Map to hold the i18n attribute value to innerHTML
    const i18nMap = {};

    // Fetch all HTML files in the given src directory
    const files = await glob(`${src}/**/*.html`);

    files.forEach((file) => {
      // Read the content of each HTML file
      const htmlContent = fs.readFileSync(file, "utf8");
      const dom = new JSDOM(htmlContent);
      const document = dom.window.document;

      // Query all elements with the i18n attribute
      const elements = document.querySelectorAll("[i18n]");

      elements.forEach((el) => {
        // Ignore elements with i18n attribute.
        const i18nValue = el.getAttribute("i18n");
        if (i18nValue) {
          return;
        }

        // Encode the innerHTML as key
        const innerHTML = el.innerHTML.toString();
        const key = encodeString(innerHTML.trim());
        i18nMap[key] = { message: innerHTML };
      });
    });

    resolve(i18nMap);
  });
}

// Main function to generate translations
async function generateTranslations() {
  let sourceLocaleData = readSourceLocaleData();
  // Remove all the messages that are not prefixed with @, they'll be added as literals.
  Object.keys(sourceLocaleData).forEach((key) => {
    if (!key.startsWith("@")) {
      delete sourceLocaleData[key];
    }
  });

  // Get the literals from Js/TS files
  const codeLiterals = await searchForI18nStrings(srcDir);
  // combine sourceLocaleData and mappedLiterals into one object.
  sourceLocaleData = Object.assign(
    sourceLocaleData,
    mapLiteralsToEncodedObject(codeLiterals),
  );

  // Get the literals from HTML files
  const htmlLiterals = await parseHTMLFiles(srcDir);
  // combine htmlLiterals into sourceLocaleData
  sourceLocaleData = Object.assign(sourceLocaleData, htmlLiterals);

  const messageRequest = Object.keys(sourceLocaleData).reduce((acc, key) => {
    acc[key] = sourceLocaleData[key]["message"];
    return acc;
  }, {});
  console.log("Translation request", messageRequest);

  try {
    await Promise.all(
      targetLocales.map(async (targetLocale) => {
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

/* Regex will match the fololowing cases:

i18n("hello")
i18n('hi')
i18n("@he")
i18n("sdf;'")
i18n("")
i18n(
"hello world"
)
i18n(
"hello world
and the begening of the end"
)

i18n(
"hello world" +
"and the begening of the end"
)

i18n(
"hello world
and the begening of the end",
)

i18n("hello world".replace("Hello"))
i18n("hello world" + " again")
*/
