// containers of everything--imagine this as the viewport
import { FrameworkBase } from "./framework.js";
import { Draggable } from "./draggable.js";
import { ElementListener, Listener } from "./listener.js";
import { Layers } from "./layers.js";
import { GlobalSingleUseWidget } from "./widgets/widget.js";
import { Pos } from "./pos.js";
import { BasicWire } from "./widgets/wire.js";
var sceneIdentifiers = 0;
export class Scene extends FrameworkBase {
    draggable;
    identifier = sceneIdentifiers++;
    elListener = new Listener();
    resizeListener = new ElementListener();
    interListener = new Listener();
    bounds = new Pos({});
    widgets = [];
    nestedScenes = [];
    snapObjects = new Map();
    nextSnapObjectId = 0;
    layers = new Layers();
    wires = new Set();
    constructor({ id = null, parent = null, options = {}, style, widgets = [], doStartCentered = false, resize }) {
        super({
            name: "scene",
            id, parent,
            style,
            resize
        });
        this.draggable = new Draggable({
            viewport: this.element,
            element: parent,
            scrollX: options?.scrollX ?? true,
            scrollY: options?.scrollY ?? true,
            zoomable: options?.zoom?.able ?? true,
            options: {
                zoom: {
                    max: options?.zoom?.max ?? Number.MAX_VALUE,
                    min: options?.zoom?.min ?? 0
                }
            }
        });
        this.layers.onMove((type, zIndex) => { type.setZIndex(zIndex); });
        for (const widget of widgets) {
            this.addWidget(widget);
        }
        this.draggable.listener.on("drag", this.updateWidgetPosition.bind(this));
        this.draggable.listener.on("scroll", this.onScroll.bind(this));
        if (doStartCentered)
            this.draggable.listener.on("init", this.center.bind(this));
        this.elListener.onListen((type, isNew) => {
            if (isNew)
                this.el.addEventListener(type, this.elListener.trigger.bind(this.elListener, type));
        });
        this.elListener.on("mousedown", () => { GlobalSingleUseWidget.unbuildType("contextmenu"); });
        this.resizeListener.observe(this.el);
        this.resizeListener.on("resize", () => {
            const width = this.el.offsetWidth;
            const height = this.el.offsetHeight;
            this.bounds.setPos({ x: width, y: height });
            this.elListener.trigger("resize", new Event("resize", {}));
        });
        this.resizeListener.on("scale", (scale) => {
            this.updateTrackedDraggableScale(scale);
            for (const widget of this.widgets) {
                widget.updateTrackedDraggableScale(scale);
            }
        });
        this.trackDraggables(this.draggable);
    }
    addWidget(widget) {
        widget.attachTo(this);
        this.widgets.push(widget);
        this.layers.add(widget);
        this.updateIndividualWidget(widget);
        for (const snapObj of this.snapObjects.values()) {
            widget.pos.addSnapObject(snapObj);
        } // add snap objects
    }
    removeWidget(widget) {
        const index = this.widgets.indexOf(widget);
        if (index == -1)
            return; // widget doesn't exist in the scene
        this.widgets.splice(index, 1); // remove widget from list
        this.layers.remove(widget);
        widget.detachFrom(this);
        if (widget instanceof BasicWire && this.wires.has(widget))
            this.wires.delete(widget); // stop tracking wire
        for (const snapObj of this.snapObjects.values()) {
            widget.pos.removeSnapObject(snapObj);
        } // remove snap objects
    }
    updateIndividualWidget(widget) {
        if (!this.widgets.includes(widget))
            return; // don't try to update invalid widget
        this.updateIndividualWidgetPosition(widget);
        this.updateIndividualWidgetScale(widget);
    }
    updateIndividualWidgetPosition(widget) {
        if (!widget.isBuilt || widget.positioning === 0)
            return; // if positioning is 0 (doesn't move), then ignore
        const { x, y } = widget.pos.getPosData(["x", "y"]);
        const sWidth = widget.bounds.getPosComponent("x");
        const sHeight = widget.bounds.getPosComponent("y");
        const width = this.draggable.scaleIntoScreenSpace(sWidth);
        const height = this.draggable.scaleIntoScreenSpace(sHeight);
        const [sX, sY] = this.draggable.toScreenSpace(x, y);
        const viewWidth = this.bounds.getPosComponent("x");
        const viewHeight = this.bounds.getPosComponent("y");
        // outside viewable bounds
        if (sX + width < 0
            || sX > viewWidth
            || sY + height < 0
            || sY > viewHeight) {
            widget.element.classList.add("hidden"); // hide element to save on processing (I hope)
        }
        else
            widget.element.classList.remove("hidden");
        widget.element.style.left = `${sX}px`;
        widget.element.style.top = `${sY}px`;
    }
    updateIndividualWidgetScale(widget) {
        if (widget.positioning == 0)
            return; // no point in trying to multiply by 0
        const scale = (this.draggable.pos.z * widget.positioning) + 1 * (1 - widget.positioning);
        widget.setTransformation("scale", scale.toString());
        widget.setZoom(this.draggable.pos.z);
    }
    updateWidgetPosition() {
        for (const widget of this.widgets) {
            this.updateIndividualWidgetPosition(widget);
        }
    }
    updateWidgetScale() {
        for (const widget of this.widgets) {
            this.updateIndividualWidgetScale(widget);
        }
    }
    onScroll() {
        this.updateWidgetPositionAndScale();
        for (const nestedScene of this.nestedScenes) {
            nestedScene.resizeListener.trigger("scale", this.draggable.pos.z);
        }
    }
    updateWidgetPositionAndScale() {
        this.updateWidgetPosition();
        this.updateWidgetScale();
    }
    setWidgetPos(widget, x, y) {
        if (!this.widgets.includes(widget))
            return;
        const bounds = this.el.getBoundingClientRect();
        // include x/y position of scene
        const [sX, sY] = this.draggable.toSceneSpace(x - bounds.left, y - bounds.top);
        widget.setPos(sX, sY);
        this.updateIndividualWidget(widget);
    }
    center() {
        const bounds = this.bounds.getPosData(["x", "y"]);
        this.draggable.setOffsetTo(bounds.x / 2, bounds.y / 2);
    }
    addGlobalSnapObject(obj) {
        for (const widget of this.widgets) {
            widget.pos.addSnapObject(obj);
        }
        const id = this.nextSnapObjectId++;
        this.snapObjects.set(id, obj);
        return id;
    }
    removeGlobalSnapObject(obj) {
        if (typeof obj == "number")
            obj = this.snapObjects.get(obj);
        for (const widget of this.widgets) {
            widget.pos.removeSnapObject(obj);
        }
        let id = -1;
        for (const [i, snapObj] of this.snapObjects.entries()) {
            if (snapObj == obj) {
                id = i;
                break;
            }
        }
        if (id == -1)
            return false; // doesn't exist
        this.snapObjects.delete(id);
        return true; // exists
    }
    registerWire(wire) {
        this.wires.add(wire); // track wire
    }
    addNestedScene(scene) {
        this.nestedScenes.push(scene);
        scene.resizeListener.trigger("scale", this.draggable.pos.z);
    }
    removeNestedScene(scene) {
        const i = this.nestedScenes.indexOf(scene);
        if (i == -1)
            return false; // scene isn't nested
        this.nestedScenes.splice(i, 1);
        return true; // successfully removed
    }
}
//# sourceMappingURL=scene.js.map