import { Draggable } from "../draggable.js";
import { getIcon } from "../svg.js";
import { buttonDefaults } from "./defaults.js";
import { GlobalSingleUseWidget, Widget } from "./widget.js";
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
    constructor({ id, layer, positioning, pos, style, header = {}, doCursorDragIcon = true, options, content, name, resize, contextmenu = [], doZoomScale }) {
        const container = document.createElement("div");
        const headerEl = document.createElement("div");
        const body = document.createElement("div");
        if (!Array.isArray(contextmenu))
            contextmenu = [contextmenu];
        contextmenu.push({
            "header": {
                el: headerEl,
                options: "close/close/x.svg;collapse/collapse/minus.svg"
            },
            "body": {
                el: body,
                options: ""
            }
        });
        super({
            id, layer, positioning, pos, style,
            name,
            content: container,
            resize,
            doZoomScale,
            contextmenu: contextmenu
        });
        this.container = container;
        this.container.classList.add("framework-draggable-widget-containers");
        container.addEventListener("click", GlobalSingleUseWidget.unbuildType.bind(null, "contextmenu"));
        this.header = headerEl;
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
        this.contextmenus.header.listener.on("click", (item) => {
            switch (item.value) {
                case "close":
                    this.close();
                    break;
                case "collapse":
                    const isMinimized = this.minimize();
                    this.contextmenus.header.getSection(0).getItem("collapse").name = isMinimized ? "expand" : "collapse";
                    this.contextmenus.header.getSection(0).getItem("collapse").icon = isMinimized ? "plus.svg" : "minus.svg";
                    break;
            }
        });
        this.body = body;
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
                this.draggable.offsetBy(this.pos.getPosComponent("x"), this.pos.getPosComponent("y"));
                this.draggable.listener.on("dragInit", this.dragInit.bind(this));
                this.draggable.listener.on("drag", this.drag.bind(this));
                this.draggable.listener.on("dragEnd", this.dragEnd.bind(this));
                this.draggable.listener.on("selected", () => { this.scene.layers.moveToTop(this); });
            }
            else
                this.draggable.changeViewport(scene.element);
        }
    }
    dragInit() {
        if (this.doCursorDrag)
            this.header.classList.add("dragging");
        GlobalSingleUseWidget.unbuildType("contextmenu");
    }
    dragEnd() {
        if (this.doCursorDrag)
            this.header.classList.remove("dragging");
    }
    drag(d) {
        this.pos.setPos({
            x: -d.pos.x,
            y: -d.pos.y
        });
        this.scene?.updateIndividualWidget(this);
    }
    /**
     * call to toggle the minimized state of the widget
     * @returns if element is currently minimized
     */
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
            return true;
        }
        else {
            if (this.minimizeTimeout != null) { // timeout in progress
                clearTimeout(this.minimizeTimeout);
                this.minimizeTimeout = null;
            }
            this.el.classList.remove("is-minimized");
            return false;
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
}
//# sourceMappingURL=draggable-widget.js.map