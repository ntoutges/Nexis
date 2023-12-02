export class Pos {
    dimensions = new Map();
    bounds = new Map();
    constructor(data) {
        for (const component in data) {
            const dimData = data[component];
            if ("val" in dimData)
                this.dimensions.set(component, dimData.val);
            if ("min" in dimData || "max" in dimData) {
                const min = dimData.min ?? Number.MIN_VALUE;
                const max = dimData.max ?? Number.MAX_VALUE;
                this.bounds.set(component, [
                    Math.min(min, max),
                    Math.max(min, max)
                ]);
            }
        }
    }
    setPos(pos) {
        for (const component in pos) {
            const [min, max] = this.bounds.has(component) ? this.bounds.get(component) : [Number.MIN_VALUE, Number.MAX_VALUE];
            let newPos = Math.min(Math.max(pos[component], min), max);
            this.dimensions.set(component, newPos);
        }
    }
    offsetPos(pos) {
        Object.keys(pos).forEach((component) => {
            pos[component] += this.getPosComponent(component); // do offset
        });
        this.setPos(pos);
    }
    getPosComponent(component) {
        if (this.dimensions.has(component))
            return this.dimensions.get(component);
        return 0; // default value
    }
    getPosData(components) {
        const data = {};
        for (const component of components) {
            data[component] = this.getPosComponent(component);
        }
        return data;
    }
    // [components] defines which components will actually be compared
    distanceToPos(other, components) {
        let total = 0;
        for (const component of components) {
            const diff = this.getPosComponent(component) - other.getPosComponent(component);
            total += diff * diff; // diff^2
        }
        return Math.sqrt(total);
    }
    distanceToGrid(grid, components) {
        const gridPos = grid.getPointAt(this, components);
        return this.distanceToPos(gridPos, components);
    }
}
export class Grid {
    gaps;
    offsets;
    constructor(gaps, offsets) {
        this.gaps = gaps;
        this.offsets = offsets;
    }
    setOffset(pos) {
        this.offsets.setPos(pos);
    }
    offsetBy(pos) {
        this.offsets.offsetPos(pos);
    }
    getPointAt(pos, components) {
        const data = {};
        for (const component of components) {
            data[component] = { val: pos.getPosComponent(component) };
        }
        return new Pos(data);
    }
}
export class SnapPos extends Pos {
    snapPoints = [];
    snapPointIds = [];
    snapGrids = [];
    snapGridIds = [];
    nextSnapId = 0;
    snapPoint = null;
    snapRadius;
    constructor(data, snapRadius = 10) {
        super(data);
        this.snapRadius = snapRadius;
    }
    addSnapPoint(pos) {
        this.snapPoints.push(pos);
        this.snapPointIds.push(this.nextSnapId);
        return this.nextSnapId++;
    }
    getSnapPoint(id) {
        const index = this.snapPointIds.indexOf(id);
        if (index == -1)
            return null;
        return this.snapPoints[index];
    }
    removeSnapPoint(id) {
        const index = this.snapPointIds.indexOf(id);
        if (index == -1)
            return;
        this.snapPoints.splice(index, 1);
        this.snapPointIds.splice(index, 1);
    }
    addSnapGrid(grid) {
        this.snapGrids.push(grid);
        this.snapGridIds.push(this.nextSnapId);
        return this.nextSnapId++;
    }
    getSnapGrid(id) {
        const index = this.snapGridIds.indexOf(id);
        if (index == -1)
            return null;
        return this.snapGrids[index];
    }
    removeSnapGrid(id) {
        const index = this.snapGridIds.indexOf(id);
        if (index == -1)
            return null;
        this.snapGrids.splice(index, 1);
        this.snapPointIds.splice(index, 1);
    }
    setPos(pos) {
        super.setPos(pos);
        let minDist = Infinity;
        let minPos = null;
        const components = Object.keys(pos);
        // check snapPoints
        for (const point of this.snapPoints) {
            const dist = this.distanceToPos(point, components);
            if (dist < minDist) {
                minDist = dist;
                minPos = point;
            }
        }
        // check snapGrids
        for (const grid of this.snapGrids) {
            const point = grid.getPointAt(this, components);
            const dist = this.distanceToPos(point, components);
            if (dist < minDist) {
                minDist = dist;
                minPos = point;
            }
        }
        // only do snap if close enough
        if (minDist < this.snapRadius)
            this.snapPoint = minPos;
        else
            this.snapPoint = null;
    }
    // override
    getPosComponent(component) {
        if (this.snapPoint)
            return this.snapPoint.getPosComponent(component); // refer to snap point
        return super.getPosComponent(component); // else, refer to self
    }
}
//# sourceMappingURL=pos.js.map