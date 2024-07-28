import { WireSVG } from "./svg.js";
export class WireSnake extends WireSVG {
    turnDistance;
    turnRadius;
    constructor({ color, shadow, width, turnDistance = 30, turnRadius = 20 }) {
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
        let start1 = { x: p1.x + n1.x * this.turnDistance, y: p1.y + n1.y * this.turnDistance };
        let start2 = { x: p2.x + n2.x * this.turnDistance, y: p2.y + n2.y * this.turnDistance };
        let path1 = this.calculatePathToTarget(start1, n1, target);
        let d = this.buildRoundedPath([
            p1,
            ...path1.path,
            ...this.calculatePathToTarget(target, path1.dir, start2).path,
            p2
        ]);
        // let path = `M${p1.x},${p1.y} ${p1D} ${p2D} L${p2.x},${p2.y}`;
        this.wirePaths.get("path").setAttribute("d", d);
        this.wirePaths.get("shadow").setAttribute("d", d);
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
    removeExtraneousPoints(path) {
        for (let i = 2; i < path.length; i++) {
            let lastPoint = path[i - 2];
            let currPoint = path[i - 1];
            let nextPoint = path[i];
            let lastDir = this.calculateDirectionFromPoints(lastPoint, currPoint);
            let nextDir = this.calculateDirectionFromPoints(currPoint, nextPoint);
            // Same normal; ignore
            if ((currPoint.x == nextPoint.x && currPoint.y == nextPoint.y) // The same point!
                || (lastDir.x == nextDir.x && lastDir.y == nextDir.y) // The same direction!
            ) {
                path.splice(i - 1, 1);
                i--;
            }
        }
        return path;
    }
    buildRoundedPath(path) {
        path = this.removeExtraneousPoints(path);
        let d = [`M${path[0].x},${path[1].y}`];
        const shift = { x: 0, y: 0 };
        for (let i = 2; i < path.length; i++) {
            let lastPoint = path[i - 2];
            let currPoint = path[i - 1];
            let nextPoint = path[i];
            // get sign and direction of movements
            let [d1X, d1Y] = [currPoint.x - lastPoint.x, currPoint.y - lastPoint.y];
            let [m1X, m1Y] = [Math.sign(d1X), Math.sign(d1Y)];
            [d1X, d1Y] = [Math.abs(d1X), Math.abs(d1Y)];
            let [d2X, d2Y] = [nextPoint.x - currPoint.x, nextPoint.y - currPoint.y];
            let [m2X, m2Y] = [Math.sign(d2X), Math.sign(d2Y)];
            [d2X, d2Y] = [Math.abs(d2X), Math.abs(d2Y)];
            let ccw = m1X == -m2Y && m1Y == m2X;
            let radius = Math.min(Math.max(d1X, d1Y) / 2, Math.max(d2X, d2Y) / 2, this.turnRadius);
            if (d1X) {
                d.push(`l${m1X * (d1X - radius) - shift.x},0`, // Build line segment
                `a${radius},${radius} 0 0 ${ccw ? 0 : 1} ${m1X * radius},${m2Y * radius}` // Build arc
                );
                shift.x = 0;
                shift.y = m2Y * radius;
            }
            else {
                d.push(`l0,${m1Y * (d1Y - radius) - shift.y}`, // Build line segment
                `a${radius},${radius} 0 0 ${ccw ? 0 : 1} ${m2X * radius},${m1Y * radius}` // Build arc
                );
                shift.x = m2X * radius;
                shift.y = 0;
            }
        }
        d.push(`L${path[path.length - 1].x},${path[path.length - 1].y}`);
        return d.join(" ");
    }
}
//# sourceMappingURL=orth.js.map