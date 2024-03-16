const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Updated function to search and return only the quoted literals, excluding the quotes
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

// Main function refactored to return matches instead of printing
function searchForI18nStrings(srcDirectory) {
  return new Promise((resolve, reject) => {
    // Regex to capture content inside quotes without including the quotes
    const regex = /i18n\((?:"(.*?)"|'(.*?)')\)/g;
    const filesPattern = path.join(srcDirectory, "**", "*.{ts,js}");
    glob(filesPattern, (err, files) => {
      if (err) {
        reject("Error reading files: " + err);
        return;
      }

      const allMatches = files.reduce((acc, filePath) => {
        const matches = searchInFile(filePath, regex);
        if (matches.length > 0) {
          acc[filePath] = matches;
        }
        return acc;
      }, {});

      resolve(allMatches);
    });
  });
}

// Example usage
searchForI18nStrings("./src") // Adjust the path to your src directory
  .then((matches) => {
    console.log("Matches found:", matches);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
