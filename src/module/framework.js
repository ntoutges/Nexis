// basis for everything in the module
import { Draggable } from "./draggable.js";
import { Saveable } from "../saveable/saveable.js";
export class FrameworkBase extends Saveable {
    el = document.createElement("div");
    resizeData = {
        option: null,
        dragEl: null,
        draggable: null
    };
    trackedDraggables = [];
    constructor({ name, parent = null, children = [], style, resize = "none" }) {
        super();
        this.el.classList.add("frameworks");
        this.resizeData.option = resize;
        const names = name.split(" ");
        for (const partialName of names) {
            this.el.classList.add(`framework-${partialName}`);
        }
        for (const child of children) {
            this.el.append(child);
        }
        if (this.resizeData.option != "none") {
            if (this.resizeData.option == "horizontal" || this.resizeData.option == "both") {
                this.createResizeElement("left");
                this.createResizeElement("right");
            }
            if (this.resizeData.option == "vertical" || this.resizeData.option == "both") {
                this.createResizeElement("top");
                this.createResizeElement("bottom");
            }
            if (this.resizeData.option == "both") {
                this.createResizeElement("top", "left");
                this.createResizeElement("top", "right");
                this.createResizeElement("bottom", "left");
                this.createResizeElement("bottom", "right");
            }
        }
        if (parent)
            this.appendTo(parent);
        if (style) {
            for (const property in style) {
                this.el.style[property] = style[property];
            }
        }
        this.addInitParams({ name, style, resize });
    }
    hide() { this.el.classList.add("hiddens"); }
    show() { this.el.classList.remove("hiddens"); }
    appendTo(parent) {
        parent.append(this.el);
        if (this.resizeData.dragEl) {
            if (!this.resizeData.draggable) { // build new draggable
                this.resizeData.draggable = new Draggable({
                    viewport: parent,
                    element: this.resizeData.dragEl,
                    zoomable: false,
                    scrollX: ["horizontal", "both"].includes(this.resizeData.option),
                    scrollY: ["vertical", "both"].includes(this.resizeData.option),
                    blockDrag: true,
                    blockScroll: true
                });
                this.resizeData.draggable.listener.on("drag", (draggable) => {
                    const resizeEl = draggable.lastEvent.target;
                    // components give: 0 for no movement; >=1 for scaling, >=2 for moving scaling
                    const xComponent = +resizeEl.classList.contains("framework-resize-drag-element-side-right") + 2 * +resizeEl.classList.contains("framework-resize-drag-element-side-left");
                    const yComponent = +resizeEl.classList.contains("framework-resize-drag-element-side-bottom") + 2 * +resizeEl.classList.contains("framework-resize-drag-element-side-top");
                    this.ezElManualResize(draggable, xComponent, yComponent);
                });
                // this.resizeData.draggable.listener.on("drag", this.manualResizeTo.bind(this));
                this.trackDraggables(this.resizeData.draggable);
            }
            else
                this.resizeData.draggable.changeViewport(parent); // modify old draggable
        }
    }
    get element() {
        return this.el;
    }
    ezElManualResize(d, xComponent = 1, yComponent = 1) {
        let dWidth = d.delta.x;
        let dHeight = d.delta.y;
        if (xComponent == 0)
            dWidth = 0;
        else if (xComponent >= 2)
            dWidth *= -1; // resize + move
        if (yComponent == 0)
            dHeight = 0;
        else if (yComponent >= 2)
            dHeight *= -1; // resize + move
        const newWidth = this.el.offsetWidth - dWidth;
        const newHeight = this.el.offsetHeight + dHeight;
        this.elManualResize(d, newWidth, newHeight);
    }
    elManualResize(d, width, height) {
        this.el.style.width = `${width}px`;
        this.el.style.height = `${height}px`;
        d.listener.trigger("resize", d);
        // remove set width/height
        this.resetBounds();
    }
    resetBounds() {
        this.el.style.width = "";
        this.el.style.height = "";
    }
    trackDraggables(...draggables) {
        this.trackedDraggables.push(...draggables);
    }
    untrackDraggable(draggable) {
        const index = this.trackedDraggables.indexOf(draggable);
        if (index === -1)
            return false;
        this.trackedDraggables.splice(index, 1);
        return true;
    }
    updateTrackedDraggableScale(scale) {
        for (const draggable of this.trackedDraggables) {
            draggable.scale = scale;
        }
    }
    createResizeElement(...sides) {
        if (!this.resizeData.dragEl) {
            this.resizeData.dragEl = document.createElement("div");
            this.resizeData.dragEl.classList.add("framework-resize-drag-container");
            this.el.append(this.resizeData.dragEl);
        }
        const resizeEl = document.createElement("div");
        resizeEl.classList.add("framework-resize-drag-element");
        for (const side of sides) {
            resizeEl.classList.add(`framework-resize-drag-element-side-${side}`);
        }
        this.resizeData.dragEl.append(resizeEl);
        return resizeEl;
    }
}
//# sourceMappingURL=framework.js.map