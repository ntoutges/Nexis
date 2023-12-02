export class Pos<Dims extends string> {
  private readonly dimensions = new Map<Dims, number>();
  private readonly bounds = new Map<Dims, [min: number, max: number]>();
  constructor(
    data: Partial<Record<Dims, { val?: number, min?: number, max?: number }>>
  ) {
    for (const component in data) {
      const dimData = data[component];
      if ("val" in dimData) this.dimensions.set(component, dimData.val);
      if ("min" in dimData || "max" in dimData) {
        const min = dimData.min ?? Number.MIN_VALUE;
        const max = dimData.max ?? Number.MAX_VALUE;
        this.bounds.set(component, [
          Math.min(min,max),
          Math.max(min,max)
        ]);
      }
    }
  }

  setPos(pos: Partial<Record<Dims, number>>) {
    for (const component in pos) {
      const [min,max] = this.bounds.has(component) ? this.bounds.get(component) : [Number.MIN_VALUE,Number.MAX_VALUE];
      let newPos = Math.min(Math.max(pos[component], min), max);
      this.dimensions.set(component, newPos);
    }
  }

  offsetPos(pos: Partial<Record<Dims, number>>) {
    Object.keys(pos).forEach((component: Dims) => {
      pos[component] += this.getPosComponent(component); // do offset
    });
    this.setPos(pos);
  }

  getPosComponent(component: Dims) {
    if (this.dimensions.has(component)) return this.dimensions.get(component);
    return 0; // default value
  }

  getPosData(components: Dims[]) {
    const data: Partial<Record<Dims, number>> = {};
    for (const component of components) { data[component] = this.getPosComponent(component); }
    return data;
  }

  // [components] defines which components will actually be compared
  distanceToPos(
    other: Pos<string>,
    components: Dims[]
  ) {
    let total = 0;
    for (const component of components) {
      const diff = this.getPosComponent(component) - other.getPosComponent(component);
      total += diff*diff; // diff^2
    }
    return Math.sqrt(total);
  }
  
  distanceToGrid(
    grid: Grid<Dims>,
    components: Dims[]
  ) {
    const gridPos = grid.getPointAt(this, components);
    return this.distanceToPos(gridPos, components);
  }
}

export class Grid<Dims extends string> {
  readonly gaps: Pos<Dims>;
  readonly offsets: Pos<Dims>;
  constructor(
    gaps: Pos<Dims>,
    offsets: Pos<Dims>
  ) {
    this.gaps = gaps;
    this.offsets = offsets;
  }

  setOffset(pos: Partial<Record<Dims, number>>) {
    this.offsets.setPos(pos);
  }

  offsetBy(pos: Partial<Record<Dims, number>>) {
    this.offsets.offsetPos(pos);
  }

  getPointAt(
    pos: Pos<Dims>,
    components: Dims[]
  ) {
    const data: Partial<Record<Dims, { val: number }>> = {};
    for (const component of components) {
      data[component] = { val: pos.getPosComponent(component) };
    }
    return new Pos(data);
  }
}

export class SnapPos<Dims extends string> extends Pos<Dims> {
  private readonly snapPoints: Pos<Dims>[] = [];
  private readonly snapPointIds: number[] = [];
  private readonly snapGrids: Grid<Dims>[] = [];
  private readonly snapGridIds: number[] = [];
  
  private nextSnapId = 0;
  private snapPoint: Pos<Dims> = null;
  
  readonly snapRadius: number;

  constructor(
    data: Partial<Record<Dims, { val?: number, min?: number, max?: number }>>,
    snapRadius: number = 10
  ) {
    super(data);
    this.snapRadius = snapRadius;
  }

  addSnapPoint(pos: Pos<Dims>): number {
    this.snapPoints.push(pos);
    this.snapPointIds.push(this.nextSnapId);
    return this.nextSnapId++;
  }
  getSnapPoint(id: number) {
    const index = this.snapPointIds.indexOf(id);
    if (index == -1) return null;
    return this.snapPoints[index];
  }
  removeSnapPoint(id: number) {
    const index = this.snapPointIds.indexOf(id);
    if (index == -1) return;
    this.snapPoints.splice(index,1);
    this.snapPointIds.splice(index,1);
  }

  addSnapGrid(grid: Grid<Dims>): number {
    this.snapGrids.push(grid);
    this.snapGridIds.push(this.nextSnapId);
    return this.nextSnapId++;
  }
  getSnapGrid(id: number) {
    const index = this.snapGridIds.indexOf(id);
    if (index == -1) return null;
    return this.snapGrids[index];
  }
  removeSnapGrid(id: number) {
    const index = this.snapGridIds.indexOf(id);
    if (index == -1) return null;
    this.snapGrids.splice(index,1);
    this.snapPointIds.splice(index,1);
  }

  setPos(pos: Partial<Record<Dims, number>>) {
    super.setPos(pos);
    
    let minDist: number = Infinity;
    let minPos: Pos<Dims> = null;

    const components = Object.keys(pos) as Dims[];

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
    if (minDist < this.snapRadius) this.snapPoint = minPos;
    else this.snapPoint = null;
  }

  // override
  getPosComponent(component: Dims) {
    if (this.snapPoint) return this.snapPoint.getPosComponent(component); // refer to snap point
    return super.getPosComponent(component); // else, refer to self
  }
}