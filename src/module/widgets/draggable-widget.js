import { Draggable } from "../draggable.js";
import { getIcon } from "../svg.js";
import { ContextMenu, sectionsBuilder } from "./contextmenu/contextmenu.js";
import { buttonDefaults } from "./defaults.js";
import { Widget } from "./widget.js";
export class DraggableWidget extends Widget {
    container;
    header = null;
    body;
    draggable = null;
    doCursorDrag;
    buttonHideTimeout = null;
    minimizeTimeout = null;
    acceptableMouseButtons;
    buttonColors = new Map();
    isClosing = false;
    contextmenu;
    constructor({ id, layer, positioning, pos, style, header = null, doCursorDragIcon = true, options, content, name, resize, contextmenu }) {
        const container = document.createElement("div");
        super({
            id, layer, positioning, pos, style,
            name,
            content: container,
            resize
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
            const titleEnd = document.createElement('div');
            titleEnd.classList.add("framework-draggable-widget-title-ends");
            this.header.append(titleEnd);
            this.doCursorDrag = doCursorDragIcon;
            if (!doCursorDragIcon) {
                this.container.classList.add("no-cursor"); // don't show dragging indication
            }
            title.style.background = header.background ?? "#999999";
            titleEnd.style.background = header.background ?? "#999999";
            this.header.style.color = header.color ?? "black";
            const buttons = document.createElement("div");
            buttons.classList.add("framework-draggable-widget-button-holder");
            for (const type in buttonDefaults) {
                const options = ("buttons" in header ? header.buttons[type] : {});
                const defOptions = buttonDefaults[type];
                if (options?.show ?? defOptions.show) {
                    const button = document.createElement("div");
                    button.classList.add(`framework-draggable-widget-${type}s`, "framework-draggable-widget-buttons");
                    button.setAttribute("title", type);
                    this.buttonColors.set(type, {
                        dormant: {
                            fill: options?.dormant?.fill ?? defOptions.dormant.fill,
                            highlight: options?.dormant?.highlight ?? defOptions.dormant.highlight
                        },
                        active: {
                            fill: options?.active?.fill ?? defOptions.active.fill,
                            highlight: options?.active?.highlight ?? defOptions.active.highlight
                        }
                    });
                    button.style.width = options?.size ?? defOptions.size;
                    button.style.height = options?.size ?? defOptions.size;
                    button.style.padding = options?.padding ?? defOptions.padding;
                    buttons.append(button);
                    button.addEventListener("mouseenter", this.updateButtonColor.bind(this, button, type, "active"));
                    button.addEventListener("mouseleave", this.updateButtonColor.bind(this, button, type, "dormant"));
                    this.updateButtonColor(button, type, "dormant");
                    button.addEventListener("mousedown", (e) => {
                        e.stopPropagation(); // prevent dragging from button
                        this.scene.layers.moveToTop(this); // still do select
                    });
                    // fetch svg data
                    getIcon(options?.icon ?? defOptions.icon).then(svg => {
                        button.append(svg);
                        svg.style.width = options?.size ?? defOptions.size;
                        svg.style.height = options?.size ?? defOptions.size;
                    });
                    switch (type) {
                        case "close":
                            button.addEventListener("click", this.close.bind(this));
                            break;
                        case "collapse":
                            button.addEventListener("click", this.minimize.bind(this));
                            break;
                    }
                }
            }
            title.append(buttons);
            this.acceptableMouseButtons = options?.acceptableMouseButtons ?? [];
            title.addEventListener("mouseenter", this.showButtons.bind(this));
            title.addEventListener("mouseleave", this.hideButtons.bind(this));
            titleEnd.addEventListener("mouseenter", this.showButtons.bind(this));
            titleEnd.addEventListener("mouseleave", this.hideButtons.bind(this));
            const itemStrs = [];
            if (contextmenu?.close ?? true)
                itemStrs.push("close/close/x.svg");
            if (contextmenu?.minimize ?? true)
                itemStrs.push("minimize/minimize/minus.svg");
            if (itemStrs.length != 0) {
                this.contextmenu = new ContextMenu({
                    items: sectionsBuilder(itemStrs.join(";"))
                });
                this.header.addEventListener("contextmenu", this.showContextMenu.bind(this));
                this.contextmenu.listener.on("click", (item) => {
                    switch (item.value) {
                        case "close":
                            this.close();
                            break;
                        case "minimize":
                            this.minimize();
                            break;
                    }
                    this.contextmenu.unbuild();
                });
            }
        }
        this.body = document.createElement("div");
        this.body.classList.add("framework-draggable-widget-bodies");
        this.body.append(content);
        this.container.append(this.body);
        this.addSceneListener("resize", (d) => { this.draggable.scale = d.scale; }); // allow gridception to work
    }
    setZoom(z) {
        super.setZoom(z); // just in case this is eventually implemented in parent class
        this.draggable?.setZoom(z);
    }
    attachTo(scene) {
        super.attachTo(scene);
        if (this.header) {
            if (!this.draggable) {
                this.draggable = new Draggable({
                    viewport: scene.element,
                    element: [
                        this.header.querySelector(".framework-draggable-widget-titles"),
                        this.header.querySelector(".framework-draggable-widget-title-ends")
                    ],
                    periphery: [this.body],
                    zoomable: false,
                    blockScroll: false,
                    input: {
                        acceptableMouseButtons: this.acceptableMouseButtons
                    }
                });
                this.draggable.offsetBy(this.pos.x, this.pos.y);
                this.draggable.listener.on("dragInit", this.dragInit.bind(this));
                this.draggable.listener.on("drag", this.drag.bind(this));
                this.draggable.listener.on("dragEnd", this.dragEnd.bind(this));
                this.draggable.listener.on("selected", () => { this.scene.layers.moveToTop(this); });
            }
            else
                this.draggable.changeViewport(scene.element);
            if (this.contextmenu)
                scene.addWidget(this.contextmenu);
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
        if (this.body.classList.contains("draggable-widget-minimize")) {
            this.showButtons();
            if (this.minimizeTimeout != null)
                return; // timeout already in progress
            this.minimizeTimeout = setTimeout(() => {
                this.el.classList.add("is-minimized");
                this.minimizeTimeout = null;
                // this.updatePositionOnResize();
            }, 300);
        }
        else {
            if (this.minimizeTimeout != null) { // timeout in progress
                clearTimeout(this.minimizeTimeout);
                this.minimizeTimeout = null;
            }
            this.el.classList.remove("is-minimized");
        }
    }
    close() {
        if (this.isClosing)
            return; // don't interrupt process
        if (this.body.classList.contains("draggable-widget-minimize")) {
            this.header.classList.add("draggable-widget-close");
            setTimeout(() => {
                this.detachFrom(this.scene);
            }, 100);
        }
        else {
            this.minimize(); // minimizing animation first
            setTimeout(() => {
                this.detachFrom(this.scene);
            }, 400);
            setTimeout(() => {
                this.header.classList.add("draggable-widget-close");
            }, 200);
        }
        this.isClosing = true;
    }
    showButtons() {
        if (this.buttonHideTimeout != null) { // stop timeout
            clearTimeout(this.buttonHideTimeout);
            this.buttonHideTimeout = null;
        }
        const title = this.header.querySelector(".framework-draggable-widget-titles");
        if (title.classList.contains("show-buttons"))
            return; // already shown
        title.classList.add("show-buttons");
        const toPad = title.querySelector(".framework-draggable-widget-button-holder").offsetWidth;
        const oldPad = +title.style.paddingRight.replace("px", "") || 0;
        title.style.paddingRight = `${toPad + oldPad + 10}px`;
    }
    hideButtons() {
        if (this.buttonHideTimeout != null) { // already working on hide
            this.buttonHideTimeout = null;
            return;
        }
        this.buttonHideTimeout = setTimeout(() => {
            this.buttonHideTimeout = null;
            if (this.body.classList.contains("draggable-widget-minimize"))
                return; // minimized, so keep
            const title = this.header.querySelector(".framework-draggable-widget-titles");
            title.classList.remove("show-buttons");
            title.style.paddingRight = ""; // remove bespoke styling
        }, 500);
    }
    updateButtonColor(button, type, set) {
        button.style.background = this.buttonColors.get(type)[set].highlight;
        button.style.fill = this.buttonColors.get(type)[set].fill;
    }
    showContextMenu(e) {
        e.preventDefault();
        this.contextmenu.build();
        this.scene.setWidgetPos(this.contextmenu, e.pageX, e.pageY);
    }
}
//# sourceMappingURL=draggable-widget.js.map