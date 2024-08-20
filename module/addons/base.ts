import { AttachableListener } from "../attachableListener.js";
import { Group } from "../group.js";
import { Ids } from "../ids.js";
import { Listener } from "../listener.js";
import { Saveable } from "../../saveable/saveable.js";
import { loadClasses } from "../scene.js";
import { Widget } from "../widgets/widget.js";
import { AddonEdgeAlias } from "./alias.js";

// this class can easily add 
export class AddonContainer {
  readonly el: HTMLElement = document.createElement("div");
  protected readonly leftEdge = new AddonEdge(this, "left");
  protected readonly rightEdge = new AddonEdge(this, "right");
  protected readonly topEdge = new AddonEdge(this, "top");
  protected readonly bottomEdge = new AddonEdge(this, "bottom");

  protected readonly addonIdEdgeMap = new Map<string, { edge: AddonEdge, id: number }>();
  readonly widget: Widget;

  constructor(widget: Widget) {
    this.el.classList.add("framework-addon-containers");
    this.widget = widget;
  }

  appendTo(parent: HTMLElement) {
    parent.append(this.el);
  }

  updateAddonPositions() {
    const width = this.el.offsetWidth;
    const height = this.el.offsetHeight;

    this.leftEdge.setSize(height);
    this.rightEdge.setSize(height);
    this.topEdge.setSize(width);
    this.bottomEdge.setSize(width);
  }

  add(id: string, side: "top" | "bottom" | "left" | "right", addon: Addon) {
    const edge = this.getEdge(side);
    if (!edge) return;
    const numericalId = edge.add(addon);
    this.addonIdEdgeMap.set(id, {
      edge,
      id: numericalId
    });
    return id;
  }

  pop(id: string) {
    if (!this.addonIdEdgeMap.has(id)) return; // addon with this id doesn't exist

    const data = this.addonIdEdgeMap.get(id);
    // this.addonIdEdgeMap.get(numericId).pop(numericId);
    data.edge.pop(data.id);
    this.addonIdEdgeMap.delete(id);
  }

  get(id: string) {
    if (!this.addonIdEdgeMap.has(id)) return null; // addon with this id doesn't exist
    const data = this.addonIdEdgeMap.get(id);
    return data.edge.get(data.id);
  }

  getEdge(side: "top" | "bottom" | "left" | "right") {
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

  save(): Record<string, any> {
    return {
      left: this.leftEdge.save(),
      right: this.rightEdge.save(),
      top: this.topEdge.save(),
      bottom: this.bottomEdge.save()
    };
  }
}

// TODO: make items overflow into custom "overflow addon"
export class AddonEdge {
  readonly el = document.createElement("div");
  private readonly ids = new Ids();
  private readonly addons = new Map<number, Addon>();
  private readonly addonListeners = new Map<number, number[]>();
  private size: number = 0;

  private _isPositioning: boolean = false;

  readonly direction: "top" | "bottom" | "left" | "right";
  readonly normal: { x: -1 | 0 | 1, y: -1 | 0 | 1 } = { x: 0, y: 0 };

  readonly addonContainer: AddonContainer;

  constructor(addonContainer: AddonContainer, direction: "top" | "bottom" | "left" | "right") {
    this.el.classList.add("framework-addon-edges", `framework-addon-edges-${direction}`);
    this.addonContainer = addonContainer;
    addonContainer.el.append(this.el);
    this.direction = direction;

    switch (this.direction) {
      case "top":
        this.normal.y = -1;
        break;
      case "bottom":
        this.normal.y = 1;
        break;
      case "left":
        this.normal.x = -1;
        break;
      case "right":
        this.normal.x = 1;
        break;
    }
  }

  add(addon: Addon): number {
    const id = this.ids.generateId();
    this.addons.set(id, addon);
    addon.attachTo(this, id);

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

  get(id: number) {
    return this.addons.has(id) ? this.addons.get(id) : null;
  }

  setSize(size: number) {
    this.size = size;
    this.el.style.width = size + "px";
    this.updatePosition();
  }

  private updatePosition() {
    this._isPositioning = true; // inhibit movement listeners
    const groups = this.assembleGroups();
    this.positionGroups(groups);
    this._isPositioning = false;
  }

  // creates groups such that no two elements within a group are overlapping
  private assembleGroups() {
    const addonGroups = new Group<Addon, { pos: number, size: number }>();

    for (const addon of Array.from(this.addons.values()).sort((a,b) => b.weight - a.weight)) {
      addonGroups.add(addon);
      const pos = Math.min(Math.max(addon.positioning * this.size, addon.size/2), this.size - addon.size/2);
      addon.position = pos;
      addonGroups.setGroupData(addon, { pos, size: addon.size });
    }

    return addonGroups;
  }

  // ensures that no two groups are overlapping
  private positionGroups(addonGroups: Group<Addon, { pos: number, size: number }>) {
    if (addonGroups.size == 0) return;

    const maxItterations = addonGroups.size; // every loop itteration, size of groups will shrink by 1. If not, then the loop is done!
    for (let i = 0; i < maxItterations; i++) {
      let wasDiff = false;
      addonGroups.forEach((group, data, brk) => {
        const intersects = this.groupIntersectsGroup(group[0], addonGroups);
        if (intersects.length == 0) return;
        wasDiff = true;

        const otherGroup = addonGroups.get(intersects[0]);
        const otherData = addonGroups.getGroupData(intersects[0]);

        const otherOffset = this.getSmallestDistanceRegion(
          data.pos,data.size,
          otherData.pos,otherData.size
        );
        otherGroup.forEach(addon => addon.position += otherOffset); // remove any overlap

        // combine groups
        addonGroups.add(group[0], addonGroups.get(intersects[0])[0]);

        // assume 'group' at offset 0
        // using formula: offset = sum(weight(addon)*offset(addon)) / sum(weight(addon))

        let offsetWeight = 0;
        let totalWeight = 0;
        for (const addon of group) {
          const offset = addon.positioning * this.size - addon.position;
          const weight = addon.weight;
          offsetWeight += offset * weight;
          totalWeight += weight;
        }

        const springOffset = offsetWeight / totalWeight;
        for (const addon of group) {
          addon.position += springOffset;
        }
        
        this.updateGroupData(addonGroups, group[0]);
        data = addonGroups.getGroupData(group[0]);
        
        const top = data.pos - data.size/2;
        const bottom = this.size - (data.pos + data.size/2);
        if (top < 0) { // ensure no items too high/left
          for (const addon of group) { addon.position -= top; }
          this.updateGroupData(addonGroups, group[0]);
          data = addonGroups.getGroupData(group[0]);
        }
        else if (bottom < 0) { // ensure no items too low/right, and doesn't push above top
          const movement = Math.min(-bottom, top);
          for (const addon of group) { addon.position -= movement; }
          this.updateGroupData(addonGroups, group[0]);
          data = addonGroups.getGroupData(group[0]);
        }

        brk();
      });
      if (!wasDiff) break; // no difference means loop can be stopped
    }
  }

  get isPositioning() { return this._isPositioning; }

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

  // private addonIntersectsGroup(
  //   addon: Addon, // element to test
  //   addonGroups: Group<Addon, { pos: number, size: number }>, // group containing elements already processed
  // ) {
  //   const intersectedAddons: Addon[] = [];

  //   addonGroups.forEach((group, data) => {
  //     // intersection between group and addon
  //     if (addon.intersectsRegion(data.pos, data.size)) {
  //       intersectedAddons.push(group[0]); // only need to store one element in the group (groups are garunteed not to be empty)
  //     }
  //   });

  //   return intersectedAddons;
  // }

  private groupIntersectsGroup(
    addon: Addon, // element in group to test
    addonGroups: Group<Addon, { pos: number, size: number }>, // group containing elements already processed
  ) {
    const addonGroup = addonGroups.get(addon);
    const addonGroupData = addonGroups.getGroupData(addon);

    const intersectedAddons: Addon[] = [];

    addonGroups.forEach((group, data) => {
      if (group == addonGroup) return; // don't compare to self
      // intersection between group and addon
      if (AddonContainer.regionsIntersect(
        addonGroupData.pos, addonGroupData.size,
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
  // private getSmallestDistance(
  //   addon: Addon,
  //   regionPos: number,
  //   regionSize: number
  // ) {
  //   return this.getSmallestDistanceRegion(regionPos, regionSize, addon.position, addon.size);
  // }

  private getSmallestDistanceRegion(
    r1Pos: number, r1Size: number,
    r2Pos: number, r2Size: number
  ) {
    const leftDist = Math.abs((r1Pos - r1Size / 2) - (r2Pos + r2Size / 2)); // distance traveled to move left (negative dir)
    const rightDist = Math.abs((r1Pos + r1Size / 2) - (r2Pos - r2Size / 2)); // distance traveled to move right (positive dir)
    return leftDist < rightDist ? -leftDist : rightDist;
  }

  

  save(): Record<string, any> {
    return Saveable.save(
      Array.from(this.addons).reduce((acc, [key,addon]) => { acc[key] = addon; return acc; }, {}),
      {"*": "addon"}
    );
  }
}

interface AddonInterface {
  content: HTMLElement
  positioning?: number // in range [0,1] (0=left/top, 1=right/bottom)
  weight?: number // value > 0, indicates how much the addon will try to stay in one place
  circleness?: number // in range [0,1] (0=square, 1=circle)
  size?: number // measured in px
};

export class Addon extends Saveable<loadClasses> {
  private _positioning: number; // number in range [0,1] indicating position within AddonEdge
  private _position: number = 0; // represents the actual position (in px)
  private _weight: number;
  private _circleness: number;
  protected _size: number;
  protected el = document.createElement("div");
  protected contentEl: HTMLElement;

  readonly listener = new Listener<"positioning" | "weight" | "size" | "move" | "close", Addon>();
  protected addonEdge: AddonEdge;
  protected moveId: number;
  protected closeId: number;

  protected interWidgetListener = new AttachableListener<string, any>(() => this.addonContainer?.widget.sceneInterListener);
  protected sceneElListener = new AttachableListener<string, Event>(() => this.addonContainer?.widget?.sceneElementListener);

  private id: number = null;

  constructor({
    content,
    positioning = 0.5, // default is centered
    weight = 100,
    circleness = 1,
    size = 16
  }: AddonInterface) {
    super();
    this.addInitParamGetter({
      positioning: () => this.positioning,
      weight: () => this.weight,
      circleness: () => this.circleness,
      size: () => this.size
    });

    this.positioning = positioning;
    this.weight = weight;
    this.circleness = circleness;
    this.size = size;

    this.el.classList.add("framework-addons");
    this.el.append(content);
    this.contentEl = content;
  }

  attachTo(addonEdge: AddonEdge | AddonEdgeAlias, id: number) {
    if (!(addonEdge instanceof AddonEdge)) {
      addonEdge.contentEl.append(this.el);
      addonEdge = addonEdge.parentAddonEdge;
    }
    else addonEdge.el.append(this.el);
    this.id = id;

    if (this.addonEdge) { // remove old listeners
      const widget = this.addonEdge.addonContainer.widget;
      widget.elListener.off(this.moveId);
      widget.elListener.off(this.closeId);
    }
    this.addonEdge = addonEdge;
    if (this.addonEdge) { // add new listeners
      const widget = this.addonEdge.addonContainer.widget;
      this.moveId = widget.elListener.on("move", this.listener.trigger.bind(this.listener, "move", this)); // add new listener
      this.closeId = widget.elListener.on("detach", this.listener.trigger.bind(this.listener, "close"));
      if (this.addonEdge.normal.x != 0) this.el.classList.add("addons-side-rotated");
    }

    this.interWidgetListener.updateValidity();
    this.sceneElListener.updateValidity();
  }

  get normal(): { x: -1 | 0 | 1, y: -1 | 0 | 1 } { return this.addonEdge ? this.addonEdge.normal : { x: 0, y: 0 }; }

  get addonContainer() { return this.addonEdge?.addonContainer; }

  get size() { return this._size; }
  get circleness() { return this._circleness; }
  get positioning() { return this._positioning; }
  get weight() { return this._weight; }
  get position() { return this._position; }

  set size(newSize) {
    this._size = Math.max(1, newSize);;
    this.listener.trigger("size", this);
    this.el.style.width = `${this._size}px`;
    this.el.style.height = `${this._size}px`;
  }
  set circleness(newCircleness) {
    this._circleness = Math.max(0, Math.min(1, newCircleness));
    this.el.style.borderRadius = `${50 * this._circleness}%`;
  }
  set positioning(newPositioning) {
    this._positioning = Math.max(0, Math.min(1, newPositioning));
    if (!this.addonEdge?.isPositioning) this.listener.trigger("positioning", this);
  }
  set weight(newWeight) { 
    this._weight = (newWeight < 1) ? 1 : newWeight;
    this.listener.trigger("weight", this);
  }
  set position(newPos) {
    this._position = newPos;
    this.el.style.left = `${newPos}px`;
    this.listener.trigger("move", this);
  }

  intersectsRegion(pos: number, size: number) {
    const distance = Math.abs(this.position - pos);
    return distance < (this.size + size) / 2;
  }
  intersectsAddon(other: Addon) {
    return this.intersectsRegion(other.position, other.size);
  }

  getPositionInScene() {
    const draggable = this.addonContainer?.widget?.scene?.draggable;
    if (!draggable) return null;

    const bounds = this.el.getBoundingClientRect();
    if (bounds.width == 0 && bounds.height == 0) { // invalid bounds--return mid-left corner of widget
      const bounds = this.addonContainer.widget.element.getBoundingClientRect();
      return draggable.toSceneSpace(
        bounds.left,
        bounds.top + bounds.height / 2
      );
    }

    return draggable.toSceneSpace(
      bounds.left + bounds.width / 2, // add size/2 to get centered x
      bounds.top + bounds.height / 2 // add size/2 to get centered y
    );
  }

  save() {
    return {
      ...super.save(),
      id: this.id,
      edge: this.addonEdge?.direction,
      widget: this.addonContainer?.widget.getId()
    };
  }

  load(state: Record<string,any>) { return state; }

  saveRef() {
    return {
      id: this.id,
      edge: this.addonEdge.direction,
      widget: this.addonContainer.widget.getId()
    };
  }
}

export class AddonTest extends Addon {
  constructor(color = "black", size = 16, positioning = 0.5) {
    const content = document.createElement("div");
    content.style.background = color;
    content.style.width = "100%";
    content.style.height = "100%"
    super({
      content,
      size,
      positioning
    });
  }
}