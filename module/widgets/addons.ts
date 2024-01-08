import { Group } from "../group.js";
import { Ids } from "../ids.js";
import { Listener } from "../listener.js";

// this class can easily add 
export class AddonContainer {
  protected readonly el: HTMLElement = document.createElement("div");
  protected leftEdge = new AddonEdge(this.el);
  protected rightEdge = new AddonEdge(this.el);
  protected topEdge = new AddonEdge(this.el);
  protected bottomEdge = new AddonEdge(this.el);

  protected readonly addonIdEdgeMap = new Map<number, AddonEdge>();
  
  constructor() {
    this.el.classList.add("framework-addon-containers");
  }

  appendTo(parent: HTMLElement) {
    parent.append(this.el);
  }

  updateAddonPositions() {
    const width = this.el.offsetWidth;
    
    this.leftEdge.setSize(width);
  }

  add(side: "top" | "bottom" | "left" | "right", addon: Addon) {
    const edge = this.getEdge(side);
    if (!edge) return;
    const id = edge.add(addon);
    this.addonIdEdgeMap.set(id, edge);
    return id;
  }

  pop(id: number) {
    if (!this.addonIdEdgeMap.has(id)) return; // addon with this id doesn't exist
    this.addonIdEdgeMap.get(id).pop(id);
    this.addonIdEdgeMap.delete(id);
  }

  private getEdge(side: "top" | "bottom" | "left" | "right") {
    switch (side) {
      case "top":
        return this.topEdge;
      case "bottom":
        return this.bottomEdge;
      case "left":
        return this.leftEdge;
      case "right":
        return this.rightEdge;
    }
    return null;
  }

  static regionsIntersect(
    r1Pos: number, r1Size: number,
    r2Pos: number, r2Size: number
  ) {
    const distance = Math.abs(r1Pos - r2Pos);
    return distance < (r1Size + r2Size) / 2;
  }
}

// TODO: make items overflow into custom "overflow addon"
export class AddonEdge {
  private readonly el = document.createElement("div");
  private readonly ids = new Ids();
  private readonly addons = new Map<number, Addon>();
  private readonly addonListeners = new Map<number, number[]>();
  private size: number = 0;

  constructor(parent: HTMLElement) {
    this.el.classList.add("framework-addon-edges");
    parent.append(this.el);
  }

  add(addon: Addon): number {
    const id = this.ids.generateId();
    this.addons.set(id, addon);
    addon.appendTo(this.el);
    
    const listenerIds: number[] = [];
    listenerIds.push(addon.listener.on("positioning", this.updatePosition.bind(this)));
    listenerIds.push(addon.listener.on("size", this.updatePosition.bind(this)));
    listenerIds.push(addon.listener.on("weight", this.updatePosition.bind(this)));

    this.addonListeners.set(id, listenerIds);

    this.updatePosition();

    return id;
  }

  pop(id: number) {
    if (!(id in this.addons)) return false;

    const addon = this.addons.get(id);
    const listenerIds = this.addonListeners.get(id);

    for (const id of listenerIds) { addon.listener.off(id); } // stop listening to addon
    
    this.addons.delete(id);
    this.updatePosition();
    return true;
  }

  setSize(size: number) {
    this.size = size;
    this.updatePosition();
  }

  private updatePosition() {
    const groups = this.assembleGroups();
    this.positionGroups(groups);
  }

  // creates groups such that no two elements within a group are overlapping
  private assembleGroups() {
    const addonGroups = new Group<Addon, { pos: number, size: number }>();

    for (const addon of this.addons.values()) {
      const desiredOffset = addon.positioning * this.size;
      addon.position = desiredOffset;

      const intersections = this.addonIntersectsGroup(addon, addonGroups);
      if (intersections.length >= 1) { // intersects with something, position needs to change
        if (intersections.length >= 2) { // more than one intersection; need to 
          addonGroups.add.apply(addonGroups, [].concat(intersections)); // combine all groups that intersect original addon into one group
        
          // update newly combined group data
          this.updateGroupData(addonGroups, intersections[0]);
        }

        const data = addonGroups.getGroupData(intersections[0]);

        // adjust element position
        const posDiff = this.getSmallestDistance(addon, data.pos, data.size);
        addon.position += posDiff;

        addonGroups.add(addon, intersections[0]); // add addon to intersections group
      }
      else {
        addonGroups.add(addon); // no element; as such, no position adjustment necessary
      }
      // update group data based on new addon element(s)
      this.updateGroupData(addonGroups, addon);
    }

    return addonGroups;
  }

  // ensures that no two groups are overlapping
  private positionGroups(addonGroups: Group<Addon, { pos: number, size: number }>) {
    const maxItterations = addonGroups.size; // every loop itteration, size of groups will shrink by 1. If not, then the loop is done!
    for (let i = 0; i < maxItterations; i++) {
      let wasDiff = false;
      addonGroups.forEach((group, data, brk) => {
        const intersects = this.groupIntersectsGroup(group[0], addonGroups);
        if (intersects.length == 0) return;
        
        const otherGroup = addonGroups.get(intersects[0]);
        const otherData = addonGroups.getGroupData(intersects[0]);

        const posDiff = this.getSmallestDistanceRegion(
          otherData.pos, otherData.size,
          data.pos, data.size
        );

        const thisWeight = otherData.size;
        const otherWeight = data.size;
        const totalWeight = thisWeight + otherWeight;

        const thisPosDiff = posDiff * thisWeight / totalWeight;
        const otherPosDiff = posDiff * otherWeight / totalWeight;
        
        for (const addon of group) {
          addon.position += thisPosDiff;
        }
        for (const addon of otherGroup) {
          addon.position -= otherPosDiff;
        }

        addonGroups.add(group[0], otherGroup[0]); // combine groups

        this.updateGroupData(addonGroups, group[0]);
        
        wasDiff = true;
        brk();
      });
      if (!wasDiff) break; // no difference means loop can be stopped
    }
  }

  private updateGroupData(
    addonGroups: Group<Addon, { pos: number, size: number }>,
    groupElement: Addon
  ) {
    let min = Infinity;
    let max = -Infinity;
    for (const gAddon of addonGroups.get(groupElement)) {
      const pos = gAddon.position;
      const halfSize = gAddon.size / 2;
      min = Math.min(min, pos - halfSize);
      max = Math.max(max, pos + halfSize);
    }

    addonGroups.setGroupData(groupElement, {
      pos: (max + min) / 2, // position is at center of bounds
      size: max - min
    });
  }

  private addonIntersectsGroup(
    addon: Addon, // element to test
    addonGroups: Group<Addon, { pos: number, size: number }>, // group containing elements already processed
  ) {
    const intersectedAddons: Addon[] = [];

    addonGroups.forEach((group,data) => {
      // intersection between group and addon
      if (addon.intersectsRegion(data.pos, data.size)) {
        intersectedAddons.push(group[0]); // only need to store one element in the group (groups are garunteed not to be empty)
      }
    });

    return intersectedAddons;
  }

  private groupIntersectsGroup(
    addon: Addon, // element in group to test
    addonGroups: Group<Addon, { pos: number, size: number }>, // group containing elements already processed
  ) {
    const addonGroup = addonGroups.get(addon);
    const addonGroupData = addonGroups.getGroupData(addon);

    const intersectedAddons: Addon[] = [];

    addonGroups.forEach((group,data) => {
      if (group == addonGroup) return; // don't compare to self
      // intersection between group and addon
      if (AddonContainer.regionsIntersect(
        addonGroupData.pos,addonGroupData.size,
        data.pos, data.size
      )) {
        intersectedAddons.push(group[0]); // only need to store one element in the group (groups are garunteed not to be empty)
      }
    });

    return intersectedAddons;
  }

  // returns signed value to indicate direction to move addon so it no longer intersects a region
  // positive indicates right, negative indicates left
  // this will return the smallest distance to travel
  private getSmallestDistance(
    addon: Addon,
    regionPos: number,
    regionSize: number
  ) {
    return this.getSmallestDistanceRegion(regionPos, regionSize, addon.position, addon.size);
  }

  private getSmallestDistanceRegion(
    r1Pos: number, r1Size: number,
    r2Pos: number, r2Size: number
  ) {
    const leftDist = Math.abs((r1Pos - r1Size/2) - (r2Pos + r2Size/2)); // distance traveled to move left (negative dir)
    const rightDist = Math.abs((r1Pos + r1Size/2) - (r2Pos - r2Size/2)); // distance traveled to move right (positive dir)
    return leftDist < rightDist ? -leftDist : rightDist;
  }
}

interface AddonInterface {
  content: HTMLElement
  positioning?: number // in range [0,1] (0=left/top, 1=right/bottom)
  // weight?: number // value > 0, indicates how much the addon will try to stay in one place
  circleness?: number // in range [0,1] (0=square, 1=circle)
  size?: number // measured in px
};

export class Addon {
  private _positioning: number; // number in range [0,1] indicating position within AddonEdge
  private _position: number = 0; // represents the actual position (in px)
  // private _weight: number;
  private _circleness: number;
  private _size: number;
  protected el = document.createElement("div"); 

  readonly listener = new Listener<"positioning" | "weight" | "size", Addon>();
  
  constructor({
    content,
    positioning = 0.5, // default is centered
    // weight = 100,
    circleness = 1,
    size = 16
  }: AddonInterface) {
    this.positioning = positioning;
    // this.weight = weight;
    this.circleness = circleness
    this.size = size

    this.el.classList.add("framework-addons");
    this.el.append(content);
  }

  appendTo(el: HTMLElement) {
    el.append(this.el);
  }

  get size() { return this._size; }
  get circleness() { return this._circleness; }
  get positioning() { return this._positioning; }
  // get weight() { return this._weight; }
  get position() { return this._position; }

  set size(newSize) {
    this._size = Math.max(1,newSize);;
    this.listener.trigger("size", this);
    this.el.style.width = `${this._size}px`;
    this.el.style.height = `${this._size}px`;
  }
  set circleness(newCircleness) {
    this._circleness = Math.max(0,Math.min(1,newCircleness));
    this.el.style.borderRadius = `${100*this._circleness}%`;
  }
  set positioning(newPositioning) {
    this._positioning = Math.max(0,Math.min(1,newPositioning));
    this.listener.trigger("positioning", this);
  }
  // set weight(newWeight) { 
  //   this._weight = (newWeight > 0) ? newWeight : 0;
  //   this.listener.trigger("weight", this);
  // }
  set position(newPos) {
    this._position = newPos;
    this.el.style.left = `${newPos}px`;
  }

  intersectsRegion(pos: number, size: number) {
    const distance = Math.abs(this.position - pos);
    return distance < (this.size + size) / 2;
  }
  intersectsAddon(other: Addon) {
    return this.intersectsRegion(other.position, other.size);
  }
}

export class AddonTest extends Addon {
  constructor(color="black", size=16, positioning=0.5) {
    const content = document.createElement("div");
    content.style.background = color;
    content.style.width = "100%";
    content.style.height = "100%"
    super({
      content,
      size,
      positioning
    })
  }
}