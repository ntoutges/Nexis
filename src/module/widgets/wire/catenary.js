import { WireBase } from "./base.js";
export class WireCatenary extends WireBase {
    drop;
    segments;
    tensionCoef;
    wireDisplay;
    wireDisplayPath;
    wireDisplayShadow;
    constructor({ width, color, shadow, drop = 100, tensionCoef = 0.001, segments = 15 }) {
        super({
            name: "catenary-wire",
            width, color, shadow,
            pointerless: true
        });
        this.addInitParams({ drop, segments, tensionCoef });
        this.drop = drop;
        this.segments = segments;
        this.tensionCoef = tensionCoef;
        this.wireDisplay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.wireDisplayShadow = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.wireDisplayPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.wireDisplay.setAttribute("fill", "none");
        this.wireDisplay.append(this.wireDisplayShadow, this.wireDisplayPath);
        this.wireEl.append(this.wireDisplay);
    }
    updateElementTransformations() {
        // calculate a/b/c values for ax^2 + bx + c of parabolic eq (parabola good approximation of catenary)
        let { x: x1, y: y1 } = this.point1.getPos();
        let { x: x3, y: y3 } = this.point2.getPos();
        const tensionLift = this.drop * Math.max(Math.min(this.tensionCoef * Math.abs(x3 - x1), 1), -1);
        const [x2, y2] = [(x1 + x3) / 2, (y1 + y3) / 2 + this.drop - tensionLift];
        // simply draw vertical line
        if (x1 == x3) {
            this.drawVLineFallback(x1, y1, y2, y3);
            return;
        }
        if (x1 == 0) { // magic eq breaks if x1=0
            // assuming x1 != x3; swap to fix eq
            let temp = x3;
            let temp2 = y3;
            x3 = x1;
            x1 = temp;
            y3 = y1;
            y1 = temp2;
        }
        const [sqX1, sqX2, sqX3] = [x1 * x1, x2 * x2, x3 * x3];
        const mainDiv = (x1 - x2) * (x1 - x3) * (x2 - x3);
        const a = -(x1 * (y2 - y3) - x2 * (y1 - y3) + x3 * (y1 - y2)) / mainDiv;
        const b = (sqX1 * (y2 - y3) - sqX2 * (y1 - y3) + sqX3 * (y1 - y2)) / mainDiv;
        const c = (sqX1 * x2 * y3 * (x1 - x2) - x2 * sqX3 * y1 * (x1 - x2) - x3 * (x1 - x3) * (sqX1 * y2 - sqX2 * y1)) / (x1 * mainDiv);
        this.drawParabola(x1, x3, a, b, c);
    }
    drawParabola(x1, x2, a, b, c) {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const step = this.getStep(maxX - minX);
        const points = [];
        const p1 = this.point1.getPos();
        const p2 = this.point2.getPos();
        points.push((p1.x < p2.x) ? [p1.x, p1.y] : [p2.x, p2.y]); // push left-most point
        let minY = Math.min(p1.y, p2.y);
        let maxY = Math.max(p1.y, p2.y);
        for (let i = 1; i < this.segments - 1; i++) {
            const x = minX + step * i;
            const y = a * x * x + b * x + c;
            if (isNaN(y)) { // invalid 'y' value
                this.updateWireDisplay("", 0, 0, 0, 0);
                return;
            }
            if (y < minY)
                minY = y;
            else if (y > maxY)
                maxY = y;
            points.push([x, y]);
        }
        points.push((p1.x < p2.x) ? [p2.x, p2.y] : [p1.x, p1.y]); // push right-most point
        let d = "";
        points.forEach(([x, y], i) => {
            if (i == 0)
                d += `M${x} ${y}`;
            else
                d += ` L${x} ${y}`;
        });
        this.updateWireDisplay(d, minX, maxX, minY, maxY);
    }
    drawVLineFallback(x, y1, y2, y3) {
        const minY = Math.min(y1, y2, y3);
        const maxY = Math.max(y1, y2, y3);
        this.updateWireDisplay(`M${x} ${minY} L${x} ${maxY}`, x, x, minY, maxY);
    }
    getStep(distance) { return distance / (this.segments - 1); }
    updateWireDisplay(d, minX, maxX, minY, maxY) {
        const padding = this._width;
        const width = (maxX - minX) + 2 * padding;
        const height = (maxY - minY) + 2 * padding;
        this.setPos(minX - padding, minY - padding);
        this.wireDisplay.setAttribute("width", `${width}`);
        this.wireDisplay.setAttribute("height", `${height}`);
        this.wireDisplay.setAttribute("viewBox", `${minX - padding} ${minY - padding} ${width} ${height}`);
        this.wireDisplayShadow.setAttribute("d", d);
        this.wireDisplayPath.setAttribute("d", d);
    }
    updateWireStyle() {
        this.wireDisplayShadow.setAttribute("stroke", this._shadow);
        this.wireDisplayPath.setAttribute("stroke", this._color);
        this.wireDisplayShadow.style.strokeWidth = `${this._width + 1}px`;
        this.wireDisplayPath.style.strokeWidth = `${this._width}px`;
    }
}
//# sourceMappingURL=catenary.js.map