import { WireSVG } from "./svg.js";
export class WireOrth extends WireSVG {
    turnDistance;
    turnRadius;
    constructor({ color, shadow, width, turnDistance = 40, turnRadius = 30 }) {
        super({
            name: "orth-wire",
            color, shadow, width
        });
        this.turnDistance = turnDistance;
        this.turnRadius = turnRadius;
        this.createPathElement("shadow");
        this.createPathElement("path");
    }
    updateElementTransformations() {
        let p1 = this.point1.getPos();
        let n1 = this.point1.normal;
        let p2 = this.point2.getPos();
        let n2 = this.point2.normal;
        const target = this.calculateTarget(p1, p2, n1, n2);
        // this.wirePaths.get("path").setAttribute("d", `M${target.x - 5},${target.y - 5} l10,0 l0,10 l-10,0, z`);
        let start1 = {
            x: p1.x + n1.x * this.turnDistance,
            y: p1.y + n1.y * this.turnDistance
        };
        let start2 = {
            x: p2.x + n2.x * this.turnDistance,
            y: p2.y + n2.y * this.turnDistance
        };
        // let p1_2 = this.calculateNextPoint(start1, n1, target);
        // this.wirePaths.get("path2").setAttribute("d", `M${p1_2.x - 5},${p1_2.y - 5} l10,0 l0,10 l-10,0, z`);
        // console.log(p1_2)
        let p1Path = this.calculatePathToTarget(start1, n1, target);
        let p2Path = this.calculatePathToTarget(target, p1Path.dir, start2);
        let p1D = p1Path.path.map((point) => `L${point.x},${point.y}`).join(" ");
        let p2D = p2Path.path.map((point) => `L${point.x},${point.y}`).join(" ");
        // let p2Path = this.calculatePathToTarget(start2, n2, target).reverse().slice(1).map((point) => `L${point.x},${point.y}`).join(" ");
        let path = `M${p1.x},${p1.y} ${p1D} ${p2D} L${p2.x},${p2.y}`;
        this.wirePaths.get("path").setAttribute("d", path);
        this.wirePaths.get("shadow").setAttribute("d", path);
        this.setSVGBounds([p1, p2, start1, start2, target]);
    }
    calculateTarget(p1, p2, n1, n2) {
        if (n1.x == n2.x && n1.y == n2.y) { // Same normal > >
            if (n1.x) { // Target point is halfway between x-axis, and minimum of y-axis
                return {
                    x: (p1.x + p2.x) / 2,
                    y: Math.max(p1.y, p2.y) + this.turnDistance
                };
            }
            if (n1.y) { // Target point is halfway between y-axis, and minimum of x-axis
                return {
                    x: Math.max(p1.x, p2.x) + this.turnDistance,
                    y: (p1.y + p2.y) / 2
                };
            }
        }
        else if ((n1.x == -n2.x && n1.y == n2.y)
            || (n1.x == n2.x && n1.y == -n2.y)) { // Opposite normal   < >
            let areHeadOn = false;
            if (n1.x)
                areHeadOn = Math.sign(p2.x - p1.x) == Math.sign(n1.x);
            if (n1.y)
                areHeadOn = Math.sign(p2.y - p1.y) == Math.sign(n1.y);
            // Points are facing away from eachother
            if (!areHeadOn) {
                if (n1.x) { // Target point is halfway between x-axis, and minimum of y-axis
                    return {
                        x: (p1.x + p2.x) / 2,
                        y: Math.max(p1.y, p2.y) + this.turnDistance
                    };
                }
                if (n1.y) { // Target point is halfway between y-axis, and minimum of x-axis
                    return {
                        x: Math.max(p1.x, p2.x) + this.turnDistance,
                        y: (p1.y + p2.y) / 2
                    };
                }
            }
        }
        else if (Math.abs(n1.x) != Math.abs(n2.x) && Math.abs(n1.y) != Math.abs(n2.y)) { // Orthogonal normal < ^ 
            let areHeadOn = false;
            if (n1.x) // < ^ or > ^
                areHeadOn = Math.sign(p2.x - p1.x) == Math.sign(n1.x) && Math.sign(p1.y - p2.y) == Math.sign(n2.y);
            if (n1.y) // ^ < or ^ >
                areHeadOn = Math.sign(p2.y - p1.y) == Math.sign(n1.y) && Math.sign(p1.x - p2.x) == Math.sign(n2.x);
            // Points are "facing" eachother
            if (areHeadOn) { // Use 'x' component of y-normaled-point and 'y' component of x-normaled-point
                return {
                    x: (n1.x) ? p2.x : p1.x,
                    y: (n1.y) ? p2.y : p1.y
                };
            }
        }
        // Fallback target point is between two given points
        return {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2
        };
    }
    calculatePathToTarget(currPoint, currDir, target) {
        let path = [currPoint];
        // Will run a max of 10 itterations (more than enough)
        for (let i = 0; i < 10; i++) {
            if (target.x == currPoint.x && target.y == currPoint.y)
                break; // You have arrived
            // Get next point
            let nextPoint = this.calculateNextPoint(currPoint, currDir, target);
            currDir = this.calculateDirectionFromPoints(currPoint, nextPoint);
            currPoint = nextPoint;
            // Add next point to list
            path.push(currPoint);
        }
        return {
            path,
            dir: currDir
        };
    }
    calculateNextPoint(currPoint, currDir, target) {
        if (currDir.x) { // Moving in < > direction; Check ^/v/curr
            // Keep moving in same direction
            if (Math.sign(target.x - currPoint.x) == Math.sign(currDir.x)) {
                return {
                    x: target.x,
                    y: currPoint.y
                };
            }
            // Rotate pi/2 rad
            return {
                x: currPoint.x,
                y: target.y
            };
        }
        // Keep moving in same direction
        if (Math.sign(target.y - currPoint.y) == Math.sign(currDir.y)) {
            return {
                x: currPoint.x,
                y: target.y
            };
        }
        // Moving in ^ v direction; Check ^/v
        return {
            x: target.x,
            y: currPoint.y
        };
    }
    calculateDirectionFromPoints(lastPoint, currPoint) {
        return {
            x: Math.sign(currPoint.x - lastPoint.x),
            y: Math.sign(currPoint.y - lastPoint.y)
        };
    }
    updateWireStyle() {
        // this.wirePaths.get("shadow").setAttribute("stroke", this._shadow);
        this.wirePaths.get("path").setAttribute("stroke", this._color);
        this.wirePaths.get("shadow").setAttribute("stroke", this._shadow);
        // this.wirePaths.get("shadow").style.strokeWidth = `${this._width + 1}px`;
        this.wirePaths.get("path").style.strokeWidth = `${this._width}px`;
        this.wirePaths.get("shadow").style.strokeWidth = `${this._width + 1}px`;
    }
}
//# sourceMappingURL=orth.js.map