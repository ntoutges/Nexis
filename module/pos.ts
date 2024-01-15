import { Listener } from "./listener.js";

export class Pos<Dims extends string> {
  private readonly dimensions = new Map<Dims, number>();
  private readonly bounds = new Map<Dims, [min: number, max: number]>();
  readonly listener = new Listener<"set", Pos<Dims>>();
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
      const [min,max] = this.bounds.has(component) ? this.bounds.get(component) : [-Number.MAX_VALUE,Number.MAX_VALUE];
      let newPos = Math.min(Math.max(pos[component], min), max);
      this.dimensions.set(component, newPos);
    }
    this.listener.trigger("set", this);
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
      const gap = this.gaps.getPosComponent(component);
      const offset = this.offsets.getPosComponent(component);
      data[component] = {
        val: Math.round((pos.getPosComponent(component) - offset) / gap) * gap + offset
      };
    }
    return new Pos(data);
  }
}

export class SnapPos<Dims extends string> extends Pos<Dims> {
  private readonly snapPoints = new Map<number, Pos<Dims>>();
  private readonly snapGrids = new Map<number, Grid<Dims>>();
  
  private nextSnapId = 0;
  private snapPoint: Pos<Dims> = null;
  
  snapRadius: number;

  constructor(
    data: Partial<Record<Dims, { val?: number, min?: number, max?: number }>>,
    snapRadius: number = 10
  ) {
    super(data);
    this.snapRadius = snapRadius;
  }

  private addSnapPoint(pos: Pos<Dims>): number {
    const id = this.nextSnapId++;
    this.snapPoints.set(id, pos);
    return this.nextSnapId;
  }
  private getSnapPoint(id: number) {
    return this.snapPoints.get(id) ?? null;
  }
  private removeSnapPoint(id: number | Pos<Dims>): boolean {
    if (id instanceof Pos) {
      for (const pos of this.snapPoints.values()) {
        if (pos == id) {
          id = pos;
          break;
        }
      }
      if (id instanceof Pos) return false; // couldn't find id, so doesn't exist
    }
    
    return this.snapPoints.delete(id);
  }

  private addSnapGrid(grid: Grid<Dims>): number {
    const id = this.nextSnapId++;
    this.snapGrids.set(id,grid);
    return this.nextSnapId;
  }
  private getSnapGrid(id: number) {
    return this.snapGrids.get(id) ?? null;
  }
  private removeSnapGrid(id: number | Grid<Dims>): boolean {
    if (id instanceof Grid) {
      for (const grid of this.snapGrids.values()) {
        if (grid == id) {
          id = grid;
          break;
        }
      }
      if (id instanceof Grid) return false; // couldn't find id, so doesn't exist
    }
    
    return this.snapPoints.delete(id);
  }

  addSnapObject(obj: Grid<Dims> | Pos<Dims>): number {
    if (obj instanceof Grid) return this.addSnapGrid(obj);
    return this.addSnapPoint(obj);
  }
  getSnapObject(id: number) {
    return this.getSnapPoint(id) ?? this.getSnapGrid(id);
  }
  removeSnapObject(id: number | Grid<Dims> | Pos<Dims>): boolean {
    if (id instanceof Pos) return this.removeSnapPoint(id);
    else if (id instanceof Grid) return this.removeSnapGrid(id);
    return this.removeSnapPoint(id) || this.removeSnapGrid(id);
  }

  setPos(pos: Partial<Record<Dims, number>>) {
    super.setPos(pos);
    
    this.snapPoint = null; // prevent current snap point from interfering
    let minDist: number = Infinity;
    let minPos: Pos<Dims> = null;
    
    const components = Object.keys(pos) as Dims[];
    
    // check snapPoints
    for (const point of this.snapPoints.values()) {
      const dist = this.distanceToPos(point, components);
      if (dist < minDist) {
        minDist = dist;
        minPos = point;
      }
    }

    // check snapGrids
    for (const grid of this.snapGrids.values()) {
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