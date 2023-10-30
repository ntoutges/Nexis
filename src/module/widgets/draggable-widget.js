import { Draggable } from "../draggable.js";
import { Widget } from "./widget.js";
export class DraggableWidget extends Widget {
    container;
    header;
    body;
    draggable = null;
    doCursorDrag;
    constructor({ id, layer, positioning, pos, style, header = {}, doCursorDrag, options, content, name }) {
        const container = document.createElement("div");
        super({
            id, layer, positioning, pos, style,
            name,
            content: container
        });
        container.append(content);
        this.container = container;
        this.container.classList.add("framework-draggable-widget-containers");
        this.header = document.createElement("div");
        this.header.classList.add("framework-draggable-widget-headers");
        this.body = document.createElement("div");
        this.body.classList.add("framework-draggable-widget-bodies");
        this.container.append(this.header);
        this.container.append(this.body);
        const title = document.createElement("div");
        title.classList.add("framework-draggable-widget-titles");
        title.setAttribute("draggable", "false");
        title.innerText = header?.title ?? "Unnamed";
        this.header.append(title);
        this.doCursorDrag = doCursorDrag;
        if (!doCursorDrag) {
            this.container.classList.add("no-cursor"); // don't show dragging indication
        }
        // if (header?.buttons?.close?.show) {
        //   const close = document.createElement("div");
        //   close.classList.add("framework-draggable-widget-closes");
        // }
        // if (header?.buttons?.collapse?.show) {
        // }
    }
    setZoom(z) {
        super.setZoom(z); // just in case this is eventually implemented in parent class
        this.draggable?.setZoom(z);
    }
    attachTo(scene) {
        super.attachTo(scene);
        this.draggable = new Draggable({
            viewport: scene.element,
            element: this.header,
            periphery: [this.container],
            zoomable: false,
            blockScroll: false
        });
        this.draggable.offsetBy(this.pos.x, this.pos.y);
        this.draggable.listener.on("dragInit", this.dragInit.bind(this));
        this.draggable.listener.on("drag", this.drag.bind(this));
        this.draggable.listener.on("dragEnd", this.dragEnd.bind(this));
    }
    dragInit() {
        if (this.doCursorDrag)
            this.header.classList.add("dragging");
    }
    dragEnd() {
        if (this.doCursorDrag)
            this.header.classList.remove("dragging");
    }
    drag(d) {
        this.pos.x = -d.pos.x;
        this.pos.y = -d.pos.y;
        this.scene?.updateIndividualWidget(this);
    }
}
//# sourceMappingURL=draggable-widget.js.map