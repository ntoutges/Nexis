import { WireBase } from "./base.js";
export class WireSVG extends WireBase {
    wireDisplay;
    wirePaths = new Map();
    constructor({ width, color, shadow, name }) {
        super({
            name,
            width, color, shadow,
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
    createPathElement(name) {
        if (this.wirePaths.has(name))
            return; // Path already exists with this name
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.wirePaths.set(name, path);
        this.wireDisplay.append(path);
    }
    setSVGBounds(x, y) {
        let isPointArr = x.length && typeof x[0] != "number";
        // Convert array of points to separate x/y arrays
        if (isPointArr) {
            y = x.map(point => point.y);
            x = x.map(point => point.x);
        }
        let minX = Math.min(...x);
        let maxX = Math.max(...x);
        let minY = Math.min(...y);
        let maxY = Math.max(...y);
        const padding = this._width;
        let paddedWidth = (maxX - minX) + 2 * padding;
        let paddedHeight = (maxY - minY) + 2 * padding;
        this.setPos(minX - padding, minY - padding);
        this.wireDisplay.setAttribute("width", paddedWidth.toString());
        this.wireDisplay.setAttribute("height", paddedHeight.toString());
        this.wireDisplay.setAttribute("viewBox", `${minX - padding} ${minY - padding} ${paddedWidth} ${paddedHeight}`);
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
    updateWireStyle() {
        this.wirePaths.forEach((path, key) => {
            // Shadow path gets special treatment
            if (key == "shadow") {
                path.setAttribute("stroke", this._shadow);
                path.style.strokeWidth = `${this._width + 1}px`;
            }
            path.setAttribute("stroke", this._color);
            path.style.strokeWidth = `${this._width}px`;
        });
    }
}
//# sourceMappingURL=svg.js.map