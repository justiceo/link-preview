// Generate icons, screenshots and other images for the extension.
// Run using `node tools/generate-images.js --src=assets/logo.png --icons`
import Jimp from "jimp";
import { parse } from "./parse.js";

class ImageGenerator {
  // options: --src, --icons, --screenshot, --marquee, --tile
  args;
  originalIconPath = "src/assets/images/logo.png";

  constructor() {
    const args = parse(process.argv);
    this.args = args;
  }

  generateImages() {
    let src = this.originalIconPath;
    if (this.args.src) {
      src = this.args.src;
    }

    return new Promise((resolve, reject) => {
      Jimp.read(src, (err, icon) => {
        if (err || !icon) {
          reject("Error reading icon: " + err);
        }

        // Generate logos of different sizes and use-cases.
        if (this.args.icons) {
          [16, 24, 32, 48, 128].forEach((size) => {
            const resized = icon.clone().resize(size, size);
            resized.write(`src/assets/logo-${size}x${size}.png`);
            resized
              .greyscale()
              .write(`src/assets/logo-gray-${size}x${size}.png`);
            ``;
            // TODO: Add paused overlay.
          });
        }

        let clone = icon.clone();
        let newName = "";
        const alignBits =
          Jimp.VERTICAL_ALIGN_MIDDLE | Jimp.HORIZONTAL_ALIGN_CENTER;
        if (this.args.screenshot) {
          newName = "screenshot-1280x800-" + src.split("/").pop().split(".")[0];
          clone = clone.cover(1280, 800, alignBits);
        } else if (this.args.tile) {
          newName = "tile-440x280-" + src.split("/").pop().split(".")[0];
          clone = clone.cover(440, 280, alignBits);
        } else if (this.args.marquee) {
          newName = "marquee-1400x560-" + src.split("/").pop().split(".")[0];
          clone = clone.cover(1400, 560, alignBits);
        }
        if (newName) {
          clone.write(`src/assets/${newName}.png`);
        }

        resolve();
      });
    });
  }
}
new ImageGenerator().generateImages();
