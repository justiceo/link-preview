import Jimp from "jimp";

// Prefer png, it scales better than jpeg for resizing purposes.
const originalIconPath = "src/assets/images/audate-logo.png";
const generateIcons = () => {
  return new Promise((resolve, reject) => {
    Jimp.read(originalIconPath, (err, icon) => {
      if (err) {
        reject();
      }

      [16, 24, 32, 48, 128].forEach((size) => {
        const colorIcon = icon.clone();
        colorIcon
          .resize(size, size)
          .write(`src/assets/images/logo-${size}x${size}.png`);
        const grayIcon = icon.clone();
        grayIcon
          .resize(size, size)
          .greyscale()
          .write(`src/assets/images/logo-gray-${size}x${size}.png`);
      });
      resolve();
    });
  });
};

/*
 * Exported tasks
 * These can be invoked by running: gulp <task>
 */
export const GenerateIcons = generateIcons;
GenerateIcons.description = "[Re]generate the set of required icons from base";

// The default task is what runs when you run `gulp` without any arguments.
export default GenerateIcons;
