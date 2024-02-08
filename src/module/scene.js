// containers of everything--imagine this as the viewport
import { FrameworkBase } from "./framework.js";
import { Draggable } from "./draggable.js";
import { Listener } from "./listener.js";
import { Layers } from "./layers.js";
import { GlobalSingleUseWidget } from "./widgets/widget.js";
var sceneIdentifiers = 0;
export class Scene extends FrameworkBase {
    draggable;
    identifier = sceneIdentifiers++;
    elListener = new Listener();
    interListener = new Listener();
    widgets = [];
    snapObjects = new Map();
    nextSnapObjectId = 0;
    layers = new Layers();
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
        this.draggable.listener.on("scroll", this.updateWidgetPositionAndScale.bind(this));
        if (doStartCentered)
            this.draggable.listener.on("init", this.centerScene.bind(this));
        this.elListener.onListen((type, isNew) => {
            if (isNew)
                this.el.addEventListener(type, this.elListener.trigger.bind(this.elListener, type));
        });
        this.elListener.on("mousedown", () => { GlobalSingleUseWidget.unbuildType("contextmenu"); });
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
        if (!widget.isBuilt)
            return;
        const widgetX = widget.pos.getPosComponent("x");
        const widgetY = widget.pos.getPosComponent("y");
        const [cX1, cY1] = this.draggable.toScreenSpace(widgetX, widgetY);
        const cX = widgetX * (1 - widget.positioning) + cX1 * widget.positioning;
        const cY = widgetY * (1 - widget.positioning) + cY1 * widget.positioning;
        const [x, y] = this.draggable.toScreenSpace(0, 0);
        const offX = cX - x * widget.positioning;
        const offY = cY - y * widget.positioning;
        const bounds = widget.bounds;
        const scale = this.draggable.pos.z;
        const sX = x * widget.positioning + offX - widget.align.x * bounds.getPosComponent("x") * scale;
        const sY = y * widget.positioning + offY - widget.align.y * bounds.getPosComponent("y") * scale;
        // outside viewable bounds
        // if ( // TODO: fix this so it actually works (seems to randomly hide visible elements, as well...)
        //   sX + bounds.width <= 0
        //   || sX >= this.draggable.bounds.width
        //   || sY + bounds.height <= 0
        //   || sY >= this.draggable.bounds.height
        // ) {
        //   widget.element.classList.add("hidden"); // hide element to save on processing (I hope)
        //   return;
        // }
        // else widget.element.classList.remove("hidden");
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
    updateWidgetPositionAndScale() {
        this.updateWidgetPosition();
        this.updateWidgetScale();
    }
    setWidgetPos(widget, x, y) {
        if (!this.widgets.includes(widget))
            return;
        const [sX, sY] = this.draggable.toSceneSpace(x, y);
        widget.setPos(sX, sY);
        this.updateIndividualWidget(widget);
    }
    centerScene(d) {
        this.draggable.offsetBy(d.bounds.width / 2, d.bounds.height / 2);
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
}
//# sourceMappingURL=scene.js.map