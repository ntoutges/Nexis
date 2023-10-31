import { Draggable } from "../draggable.js";
import { Widget } from "./widget.js";
export class DraggableWidget extends Widget {
    container;
    header = null;
    body;
    draggable = null;
    doCursorDrag;
    constructor({ id, layer, positioning, pos, style, header = null, doCursorDrag, options, content, name }) {
        const container = document.createElement("div");
        super({
            id, layer, positioning, pos, style,
            name,
            content: container
        });
        this.container = container;
        this.container.classList.add("framework-draggable-widget-containers");
        if (header) {
            this.header = document.createElement("div");
            this.header.classList.add("framework-draggable-widget-headers");
            this.container.append(this.header);
            const title = document.createElement("div");
            title.classList.add("framework-draggable-widget-titles");
            title.setAttribute("draggable", "false");
            title.innerText = header?.title ?? "Unnamed";
            this.header.append(title);
            this.doCursorDrag = doCursorDrag;
            if (!doCursorDrag) {
                this.container.classList.add("no-cursor"); // don't show dragging indication
            }
            const buttons = document.createElement("div");
            buttons.classList.add("framework-draggable-widget-button-holder");
            if (header.buttons?.collapse?.show) {
                const collapse = document.createElement("div");
                collapse.classList.add("framework-draggable-widget-collapses", "framework-draggable-widget-buttons");
                collapse.setAttribute("title", "collapse");
                collapse.style.background = header.buttons.collapse?.background ?? "yellow";
                collapse.style.width = header.buttons.collapse?.size ?? "15px";
                collapse.style.height = header.buttons.collapse?.size ?? "15px";
                buttons.append(collapse);
                collapse.addEventListener("click", this.minimize.bind(this));
            }
            if (header.buttons?.close?.show) {
                const close = document.createElement("div");
                close.classList.add("framework-draggable-widget-closes", "framework-draggable-widget-buttons");
                close.setAttribute("title", "close");
                close.style.background = header.buttons.close?.background ?? "red";
                close.style.width = header.buttons.close?.size ?? "15px";
                close.style.height = header.buttons.close?.size ?? "15px";
                buttons.append(close);
            }
            this.header.append(buttons);
        }
        this.body = document.createElement("div");
        this.body.classList.add("framework-draggable-widget-bodies");
        this.body.append(content);
        this.container.append(this.body);
    }
    setZoom(z) {
        super.setZoom(z); // just in case this is eventually implemented in parent class
        this.draggable?.setZoom(z);
    }
    attachTo(scene) {
        super.attachTo(scene);
        if (this.header) {
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
    minimize() {
        this.body.classList.toggle("draggable-widget-minimize");
    }
}
//# sourceMappingURL=draggable-widget.js.map