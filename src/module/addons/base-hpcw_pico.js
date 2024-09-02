import { AttachableListener } from "../attachableListener.js";
import { Group } from "../group.js";
import { Ids } from "../ids.js";
import { Listener } from "../listener.js";
import { Saveable } from "../../saveable/saveable.js";
// this class can easily add 
export class AddonContainer {
    el = document.createElement("div");
    leftEdge = new AddonEdge(this, "left");
    rightEdge = new AddonEdge(this, "right");
    topEdge = new AddonEdge(this, "top");
    bottomEdge = new AddonEdge(this, "bottom");
    addonIdEdgeMap = new Map();
    revAddonIdEdgeMap = new Map();
    widget;
    constructor(widget) {
        this.el.classList.add("nexis-addon-containers");
        this.widget = widget;
    }
    appendTo(parent) {
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
    add(id, side, layer, addon) {
        if (this.addonIdEdgeMap.has(id))
            return; // Addon already added
        const edge = this.getEdge(side);
        if (!edge)
            return;
        const numericalId = edge.add(layer, addon);
        this.addonIdEdgeMap.set(id, {
            edge,
            id: numericalId
        });
        if (!this.revAddonIdEdgeMap.has(side))
            this.revAddonIdEdgeMap.set(side, new Map());
        this.revAddonIdEdgeMap.get(side).set(numericalId, id);
        return id;
    }
    pop(id) {
        if (!this.addonIdEdgeMap.has(id))
            return; // addon with this id doesn't exist
        const data = this.addonIdEdgeMap.get(id);
        data.edge.pop(data.id);
        this.addonIdEdgeMap.delete(id);
        this.revAddonIdEdgeMap.get(data.edge.direction)?.delete(data.id);
        if (this.revAddonIdEdgeMap.get(data.edge.direction)?.size == 0)
            this.revAddonIdEdgeMap.delete(data.edge.direction);
    }
    get(id) {
        if (!this.addonIdEdgeMap.has(id))
            return null; // addon with this id doesn't exist
        const data = this.addonIdEdgeMap.get(id);
        return data.edge.get(data.id);
    }
    getEdge(side) {
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
    static regionsIntersect(r1Pos, r1Size, r2Pos, r2Size) {
        const distance = Math.abs(r1Pos - r2Pos);
        return distance < (r1Size + r2Size) / 2;
    }
    save() {
        return {
            left: this.convertIdsToString(this.leftEdge.save(), "left"),
            right: this.convertIdsToString(this.rightEdge.save(), "right"),
            top: this.convertIdsToString(this.topEdge.save(), "top"),
            bottom: this.convertIdsToString(this.bottomEdge.save(), "bottom")
        };
    }
    convertIdsToString(edgeSave, side) {
        let converted = {};
        const map = this.revAddonIdEdgeMap.get(side);
        for (let id in edgeSave) {
            converted[map.get(+id)] = edgeSave[id];
        }
        return converted;
    }
}
// TODO: make items overflow into custom "overflow addon"
export class AddonEdge {
    el = document.createElement("div");
    ids = new Ids();
    addons = new Map();
    layers = new Map();
    addonListeners = new Map();
    size = 0;
    _isPositioning = false;
    direction;
    normal = { x: 0, y: 0 };
    addonContainer;
    constructor(addonContainer, direction) {
        this.el.classList.add("nexis-addon-edges", `nexis-addon-edges-${direction}`);
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
    add(layer, addon) {
        const id = this.ids.generateId();
        this.addons.set(id, { addon, layer });
        addon.attachTo(this, id);
        // Track which layer each addon is on
        if (!this.layers.has(layer))
            this.layers.set(layer, new Set());
        this.layers.get(layer).add(id);
        const listenerIds = [];
        listenerIds.push(addon.listener.on("positioning", this.updatePosition.bind(this)));
        listenerIds.push(addon.listener.on("size", this.updatePosition.bind(this)));
        listenerIds.push(addon.listener.on("weight", this.updatePosition.bind(this)));
        this.addonListeners.set(id, listenerIds);
        this.updatePosition();
        return id;
    }
    pop(id) {
        if (!(id in this.addons))
            return false;
        const { addon, layer } = this.addons.get(id);
        const listenerIds = this.addonListeners.get(id);
        for (const id of listenerIds) {
            addon.listener.off(id);
        } // stop listening to addon
        this.addons.delete(id);
        // Update layer data
        this.layers.get(layer)?.delete(id);
        if (this.layers.size == 0)
            this.layers.delete(layer);
        this.updatePosition();
        return true;
    }
    get(id) {
        return this.addons.has(id) ? this.addons.get(id).addon : null;
    }
    setSize(size) {
        this.size = size;
        this.el.style.width = size + "px";
        this.updatePosition();
    }
    updatePosition() {
        for (const layer of this.layers.keys()) {
            this._isPositioning = true; // inhibit movement listeners
            const groups = this.assembleGroups(layer);
            this.positionGroups(groups);
            this._isPositioning = false;
        }
    }
    // creates groups such that no two elements within a group are overlapping
    assembleGroups(layer) {
        if (!this.layers.has(layer))
            return; // Empty layer
        const addons = Array.from(this.layers.get(layer)).map(id => this.addons.get(id).addon);
        const addonGroups = new Group();
        for (const addon of addons.sort((a, b) => b.weight - a.weight)) {
            addonGroups.add(addon);
            const pos = Math.min(Math.max(addon.positioning * this.size, addon.size / 2), this.size - addon.size / 2);
            addon.position = pos;
            addonGroups.setGroupData(addon, { pos, size: addon.size });
        }
        return addonGroups;
    }
    // ensures that no two groups are overlapping
    positionGroups(addonGroups) {
        if (addonGroups.size == 0)
            return;
        const maxItterations = addonGroups.size; // every loop itteration, size of groups will shrink by 1. If not, then the loop is done!
        for (let i = 0; i < maxItterations; i++) {
            let wasDiff = false;
            addonGroups.forEach((group, data, brk) => {
                const intersects = this.groupIntersectsGroup(group[0], addonGroups);
                if (intersects.length == 0)
                    return;
                wasDiff = true;
                const otherGroup = addonGroups.get(intersects[0]);
                const otherData = addonGroups.getGroupData(intersects[0]);
                const otherOffset = this.getSmallestDistanceRegion(data.pos, data.size, otherData.pos, otherData.size);
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
                const top = data.pos - data.size / 2;
                const bottom = this.size - (data.pos + data.size / 2);
                if (top < 0) { // ensure no items too high/left
                    for (const addon of group) {
                        addon.position -= top;
                    }
                    this.updateGroupData(addonGroups, group[0]);
                    data = addonGroups.getGroupData(group[0]);
                }
                else if (bottom < 0) { // ensure no items too low/right, and doesn't push above top
                    const movement = Math.min(-bottom, top);
                    for (const addon of group) {
                        addon.position -= movement;
                    }
                    this.updateGroupData(addonGroups, group[0]);
                    data = addonGroups.getGroupData(group[0]);
                }
                brk();
            });
            if (!wasDiff)
                break; // no difference means loop can be stopped
        }
    }
    get isPositioning() { return this._isPositioning; }
    updateGroupData(addonGroups, groupElement) {
        let min = Infinity;
        let max = -Infinity;
        for (const gAddon of addonGroups.get(groupElement)) {
            const pos = gAddon.position;
            const halfSize = gAddon.size / 2;
            min = Math.min(min, pos - halfSize);
            max = Math.max(max, pos + halfSize);
        }
        addonGroups.setGroupData(groupElement, {
            pos: (max + min) / 2,
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
    groupIntersectsGroup(addon, // element in group to test
    addonGroups) {
        const addonGroup = addonGroups.get(addon);
        const addonGroupData = addonGroups.getGroupData(addon);
        const intersectedAddons = [];
        addonGroups.forEach((group, data) => {
            if (group == addonGroup)
                return; // don't compare to self
            // intersection between group and addon
            if (AddonContainer.regionsIntersect(addonGroupData.pos, addonGroupData.size, data.pos, data.size)) {
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
    getSmallestDistanceRegion(r1Pos, r1Size, r2Pos, r2Size) {
        const leftDist = Math.abs((r1Pos - r1Size / 2) - (r2Pos + r2Size / 2)); // distance traveled to move left (negative dir)
        const rightDist = Math.abs((r1Pos + r1Size / 2) - (r2Pos - r2Size / 2)); // distance traveled to move right (positive dir)
        return leftDist < rightDist ? -leftDist : rightDist;
    }
    save() {
        return Saveable.save(Array.from(this.addons).reduce((acc, [key, addonData]) => { acc[key] = addonData; return acc; }, {}), { "*.addon": "addon" });
    }
}
;
export class Addon extends Saveable {
    _positioning; // number in range [0,1] indicating position within AddonEdge
    _position = 0; // represents the actual position (in px)
    _weight;
    _circleness;
    _size;
    el = document.createElement("div");
    contentEl;
    listener = new Listener();
    addonEdge;
    priority;
    moveId;
    openId;
    closeId;
    dragEndId;
    dragInitId;
    interWidgetListener = new AttachableListener(() => this.addonContainer?.widget.sceneInterListener);
    sceneElListener = new AttachableListener(() => this.addonContainer?.widget?.sceneElementListener);
    id = null;
    moveTimeout = null;
    constructor({ content, positioning = 0.5, // default is centered
    weight = 100, circleness = 1, size = 16, priority = 0 }) {
        super();
        this.addInitParams({ priority });
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
        this.priority = priority;
        this.el.classList.add("nexis-addons");
        this.el.append(content);
        this.contentEl = content;
    }
    attachTo(addonEdge, id) {
        if (!(addonEdge instanceof AddonEdge)) {
            addonEdge.contentEl.append(this.el);
            addonEdge = addonEdge.parentAddonEdge;
        }
        else
            addonEdge.el.append(this.el);
        this.id = id;
        if (this.addonEdge) { // remove old listeners
            const widget = this.addonEdge.addonContainer.widget;
            widget.elListener.off(this.moveId);
            widget.elListener.off(this.openId);
            widget.elListener.off(this.closeId);
            widget.elListener.off(this.dragEndId);
            widget.elListener.off(this.dragInitId);
        }
        this.addonEdge = addonEdge;
        if (this.addonEdge) { // add new listeners
            const widget = this.addonEdge.addonContainer.widget;
            this.moveId = widget.elListener.on("move", this.listener.trigger.bind(this.listener, "move", this), this.priority); // add new listener
            this.openId = widget.elListener.on("attach", this.listener.trigger.bind(this.listener, "open"), this.priority);
            this.closeId = widget.elListener.on("detach", this.listener.trigger.bind(this.listener, "close"), this.priority);
            this.dragEndId = widget.elListener.on("dragend", this.listener.trigger.bind(this.listener, "dragend"), this.priority);
            this.dragInitId = widget.elListener.on("draginit", this.listener.trigger.bind(this.listener, "draginit"), this.priority);
            if (this.addonEdge.normal.x != 0)
                this.el.classList.add("addons-side-rotated");
            // Widget already attached
            if (this.addonContainer.widget.scene)
                this.listener.trigger("open", this);
        }
        else {
            // Removed from widget; Treat as if attached widget was closed.
            this.listener.trigger("close", this);
        }
        this.interWidgetListener.updateValidity();
        this.sceneElListener.updateValidity();
    }
    get normal() { return this.addonEdge ? this.addonEdge.normal : { x: 0, y: 0 }; }
    get addonContainer() { return this.addonEdge?.addonContainer; }
    get size() { return this._size; }
    get circleness() { return this._circleness; }
    get positioning() { return this._positioning; }
    get weight() { return this._weight; }
    get position() { return this._position; }
    set size(newSize) {
        this._size = Math.max(1, newSize);
        ;
        this.listener.trigger("size", this);
        this.el.style.width = `${this._size}px`;
        this.el.style.height = `${this._size}px`;
        this.el.classList.toggle("nexis-addon-hidden", newSize == 0);
    }
    set circleness(newCircleness) {
        this._circleness = Math.max(0, Math.min(1, newCircleness));
        this.el.style.borderRadius = `${50 * this._circleness}%`;
    }
    set positioning(newPositioning) {
        this._positioning = Math.max(0, Math.min(1, newPositioning));
        if (!this.addonEdge?.isPositioning)
            this.listener.trigger("positioning", this);
    }
    set weight(newWeight) {
        this._weight = (newWeight < 1) ? 1 : newWeight;
        this.listener.trigger("weight", this);
    }
    set position(newPos) {
        if (this.moveTimeout)
            clearTimeout(this.moveTimeout);
        this.moveTimeout = setTimeout(() => {
            this.moveTimeout = null;
            this.el.classList.remove("nexis-addon-reorganizing"); // Remove smooth movement
        }, 100);
        this.el.classList.add("nexis-addon-reorganizing"); // Allow smooth movement
        // Trigger CSS reflow
        this.el.offsetLeft;
        this._position = newPos;
        this.el.style.left = `${newPos}px`;
        this.listener.trigger("move", this);
    }
    intersectsRegion(pos, size) {
        const distance = Math.abs(this.position - pos);
        return distance < (this.size + size) / 2;
    }
    intersectsAddon(other) {
        return this.intersectsRegion(other.position, other.size);
    }
    /**
     * @param center If true: will return the center of the addon. Otherwise, will return the top-left corner
     */
    getPositionInScene(center = true) {
        const draggable = this.addonContainer?.widget?.scene?.draggable;
        if (!draggable)
            return null;
        const bounds = this.el.getBoundingClientRect();
        if (bounds.width == 0 && bounds.height == 0) { // invalid bounds--return mid-left corner of widget
            const bounds = this.addonContainer.widget.element.getBoundingClientRect();
            return draggable.toSceneSpace(bounds.left, bounds.top + bounds.height / 2);
        }
        return draggable.toSceneSpace(bounds.left + (center ? bounds.width / 2 : 0), // add size/2 to get centered x
        bounds.top + (center ? bounds.height / 2 : 0) // add size/2 to get centered y
        );
    }
    offsetWidgetPos(deltaX, deltaY, ..._args) {
        if (!this.addonContainer?.widget)
            return;
        this.addonContainer.widget.pos.offsetPos({ x: deltaX, y: deltaY });
    }
    // Move addon by moving widget
    setAddonPos(desiredX, desiredY, ...args) {
        if (!this.addonContainer?.widget)
            return;
        const [x, y] = this.getPositionInScene();
        this.offsetWidgetPos(desiredX - x, desiredY - y, ...args);
    }
    dragWidget(x, y) {
        if (!this.addonContainer?.widget)
            return; // No widget available to drag
        this.addonContainer.widget.pos.offsetPos({ x, y });
    }
    repositionWidget(x, y) {
        if (!this.addonContainer?.widget)
            return; // No widget available to drag
        this.addonContainer.widget.pos.setPos({ x, y });
    }
    isWidgetDragging() {
        return (this.addonContainer?.widget) ? this.addonContainer.widget.isDragging : false;
    }
    save() {
        return {
            ...super.save(),
            id: this.id,
            edge: this.addonEdge?.direction,
            widget: this.addonContainer?.widget.getId()
        };
    }
    load(state) { return state; }
    // Save Reference (identifier for this addon)
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
        content.style.height = "100%";
        super({
            content,
            size,
            positioning
        });
    }
}
//# sourceMappingURL=base.js.map