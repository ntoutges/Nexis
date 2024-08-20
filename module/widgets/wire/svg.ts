import { WireBase } from "./base.js";

export abstract class WireSVG extends WireBase {
  protected readonly wireDisplay: SVGElement;
  protected readonly wirePaths = new Map<string, SVGPathElement>();

  constructor({
    width,color,shadow,

    name
  }: {
    name: string
    
    width?: number,
    color?: string,
    shadow?: string
  }) {
    super({
      name,
      width,color,shadow,
      pointerless: true
    });

    // Create and initialize main svg
    this.wireDisplay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.wireDisplay.setAttribute("fill", "none");

    this.createPathElement("shadow");
    this.createPathElement("path");

    this.wireEl.append(this.wireDisplay);
  }

  // Add in another path
  protected createPathElement(name: string) {
    if (this.wirePaths.has(name)) return; // Path already exists with this name
    
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    this.wirePaths.set(name, path);
    this.wireDisplay.append(path);
  }


  protected setSVGBounds(
    points: { x: number, y: number }[]
  ): {
    min: { x: number, y: number },
    max: { x: number, y: number }
  };
  /**
   * @param x The possible x-coordinates of points that should be encompassed by the SVG rectangle
   * @param y The possible y-coordinates of points that should be encompassed by the SVG rectangle
   */
  protected setSVGBounds(x: number[], y: number[] ): { minX: number, minY: number, maxX: number, maxY: number };
  protected setSVGBounds(
    x: number[] | { x: number, y: number }[],
    y?: number[]
  ) {
    let isPointArr = x.length && typeof x[0] != "number";

    // Convert array of points to separate x/y arrays
    if (isPointArr) {
      y = (x as { x: number, y: number }[]).map(point => point.y);
      x = (x as { x: number, y: number }[]).map(point => point.x);
    }

    let minX = Math.min(...x as number[]);
    let maxX = Math.max(...x as number[]);
    let minY = Math.min(...y);
    let maxY = Math.max(...y);

    const padding = this._width;
    let paddedWidth = (maxX - minX) + 2*padding;
    let paddedHeight = (maxY - minY) + 2*padding;

    this.setPos(minX - padding, minY - padding);
    this.wireDisplay.setAttribute("width", paddedWidth.toString());
    this.wireDisplay.setAttribute("height", paddedHeight.toString());

    this.wireDisplay.setAttribute("viewBox", `${minX-padding} ${minY-padding} ${paddedWidth} ${paddedHeight}`);

    return isPointArr ? {
      min: {
        x: minX,
        y: minY
      },
      max: {
        x: maxX,
        y: maxY
      }
    } : {
      minX, minY,
      maxX, maxY
    };
  }

  protected updateWireStyle(): void {
    this.wirePaths.forEach((path, key) => {
      
      // Shadow path gets special treatment
      if (key == "shadow") {
        path.setAttribute("stroke", this._shadow);
        path.style.strokeWidth = `${this._width + 1}px`;
        return;
      }

      path.setAttribute("stroke", this._color);
      path.style.strokeWidth = `${this._width}px`;
    });
    
  }
}