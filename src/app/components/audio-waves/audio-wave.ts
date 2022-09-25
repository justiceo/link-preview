// A class for generating audio-waves inside a given Canvas element.

/*
 * To test changes to this function, copy-paste this entire file here https://codepen.io/justiceo/pen/PoEVEvw.
 * and uncomment the lines below:
 * document.addEventListener("DOMContentLoaded",
 *     () => {
 *         const aw = new AudioWave();
 *         aw.init(document.getElementById('canvas') as HTMLCanvasElement);
 *     }, false);
 */
export class AudioWave {
  canvas!: HTMLCanvasElement;
  renderingContext!: CanvasRenderingContext2D;
  waves: Wave[] = [];

  config!: AudioWaveConfig;

  // The animation ID of the current running animation frame.
  animationId?: number;

  // TODO: Slowly add and remove nodes to avoid jank due to complete canvas redraw.
  init(canvas: HTMLCanvasElement, config: AudioWaveConfig): boolean {
    this.canvas = canvas;
    this.config = config;
    // This may be null if another context already in use, https://stackoverflow.com/a/13406681.
    const context = this.canvas.getContext('2d');
    if (context == null) {
      console.error("Unable to obtain '2d' context for Canvas");
      return false;
    }
    this.renderingContext = context;
    // Clear waves since #init may be called multiple times per instance.
    this.waves = [];

    // Clear animation frames.
    if (this.animationId) {
      window.cancelAnimationFrame(this.animationId);
    }
    this.resizeCanvas(this.canvas, this.config.width);
    this.rotateCanvas(this.canvas, this.config.rotation);
    this.config.screenColors.forEach((color) =>
      this.waves.push(new Wave(this.canvas, color, this.config.nodeCount))
    );
    this.update();
    return true;
  }

  /*
   * This function runs the animation. To get its gist, comment out #requestAnimationFrame.
   * It may be invoked 60x per second on 60fps browsers to update the canvas and should be as fast as possible to avoid dropping frames.
   * count = 0;
   */
  private update() {
    /*
     * Anneal node count.
     * each 2 seconds call the createNewObject() function
     */

    /*
     * if (++this.count % 10 ==  0) {
     *   this.count = 0;
     *   if (this.nodeCount > this.targetNodeCount) {
     *     this.waves.forEach((w) => w.pop());
     *     this.nodeCount--;
     *   }
     * }
     * TODO: Try adjusting the height via Math.sin.
     */

    this.renderingContext.fillStyle = this.config.opaqueColor;
    this.renderingContext.globalCompositeOperation = 'source-over';
    this.renderingContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.renderingContext.globalCompositeOperation = 'screen';
    this.waves.forEach((wave) => {
      wave.points.forEach((point: Point) => this.bounceY(point));
      this.drawWave(wave);
    });

    this.animationId = requestAnimationFrame(() => this.update());
  }

  private bounceY(point: Point) {
    // The smaller this number, the more the actual height is determined by the random yBase leading to more entropy.
    const entropy = 20;
    point.y =
      (this.config.height / 2) * Math.sin(point.yBase / entropy) +
      this.canvas.height / 2;

    // Increase the randomly generated Y value with a tiny amount to avoid a repeating loop.
    point.yBase += 0.3;
  }

  private drawWave(wave: Wave) {
    let diff = function (a: number, b: number) {
      return (b - a) / 2 + a;
    };

    this.renderingContext.fillStyle = wave.color;
    this.renderingContext.beginPath();
    this.renderingContext.moveTo(0, this.canvas.height);
    this.renderingContext.lineTo(wave.points[0].x, wave.points[0].y);

    // Draw a quadratic curve from point i to the middle of point i and i+1.
    for (let i = 0; i < wave.points.length; i++) {
      if (wave.points[i + 1]) {
        // Change this to #lineTo to visualize points.
        this.renderingContext.quadraticCurveTo(
          wave.points[i].x,
          wave.points[i].y,
          diff(wave.points[i].x, wave.points[i + 1].x),
          diff(wave.points[i].y, wave.points[i + 1].y)
        );
      } else {
        this.renderingContext.lineTo(wave.points[i].x, wave.points[i].y);
        this.renderingContext.lineTo(this.canvas.width, this.canvas.height);
      }
    }
    // Join all the end points and paint.
    this.renderingContext.closePath();
    this.renderingContext.fill();
  }

  private resizeCanvas(canvas: HTMLCanvasElement, width?: number) {
    if (width) {
      canvas.width = width;
    } else {
      if (window.innerWidth > 1920) {
        canvas.width = window.innerWidth;
      } else {
        canvas.width = 1920;
      }
    }

    canvas.height = this.config.height;
  }

  private rotateCanvas(canvas: HTMLCanvasElement, rotation: number) {
    canvas.style.transform = 'rotate(' + rotation + 'deg)';
  }
}

class Wave {
  color: string;
  points: Point[];
  canvasWidth: number;
  constructor(canvas: HTMLCanvasElement, color: string, nodeCount: number) {
    this.color = color;
    this.points = [];
    this.canvasWidth = canvas.width;

    for (let i = 0; i <= nodeCount + 2; i++) {
      const p = new Point();
      p.x = ((i - 1) * canvas.width) / nodeCount;
      // p.y is derived in #bounce using this base.
      p.yBase = Math.random() * 200;
      this.points.push(p);
    }
  }

  pop() {
    const i = Math.random() * this.points.length;
    this.points.splice(i, 1);
    const step = this.canvasWidth / this.points.length;
    for (let i = 0; i < this.points.length; i++) {
      this.points[i].x = (i - 1) * step;
    }
  }
}

/*
 * To see this point on the canvas,
 * change #quadraticCurveTo to #lineTo in #drawWave.
 */
class Point {
  x = 0;
  y = 0;
  yBase = 0;
}

export interface AudioWaveConfig {
  /*
   * This determines the width of the canvas, and by extension the spacing between node peaks (or frequency).
   * Set to 0 to use the full width of the window.
   */
  width: number;

  // This determines the height of the canvas, and by extension the height (or amplitude) of the waves.
  height: number;

  // This determines the number of peaks and troughs visible at a time. 1 - flat barely overlapping waves, 100 - a riot of waves.
  nodeCount: number;

  // This is a dynamically set value. We anneal nodeCount with each frame to match targetNodeCount.
  targetNodeCount: number;

  // This is the color from which screening (or color bleaching) begins.
  opaqueColor: string;

  /*
   * These three colors are 'screen'ed out of the topColor to create the bottom color. See https://colorblendy.com/#!/screen.
   * To determine  what the final screened out color would be (usually close to #fff) - use a color picker :D
   * If needed programmatically, here is the formular `Cscreen = 1 - [(1 - Ca) * (1 - Cb) * (1 - Cc)].
   * Where Cx is a color and 1-Cx is an invertion of Cx.
   * Based on the definition here https://developer.mozilla.org/en-US/docs/Web/CSS/blend-mode#values
   * And https://webdesign.tutsplus.com/tutorials/blending-modes-in-css-color-theory-and-practical-application--cms-25201.
   * For inverting a color, see https://stackoverflow.com/a/6961743.
   */
  screenColors: Array<string>;

  // Canvas element rotation in degrees.
  rotation: number;
}

export const DefaultConfig: AudioWaveConfig = {
  width: 400,
  height: 10,
  nodeCount: 2,
  targetNodeCount: 2,
  opaqueColor: '#2136BB',
  screenColors: ['#ff0000', '#00ff00', '#0000ff'],
  rotation: 0,
};

export const applyConfig = (props: any) => {
  return Object.assign({}, DefaultConfig, props) as AudioWaveConfig;
};
