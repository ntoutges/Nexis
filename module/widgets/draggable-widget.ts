import { Draggable } from "../draggable.js";
import { Scene } from "../scene.js";
import { buttonDefaults } from "./defaults.js";
import { DraggableWidgetInterface, buttonTypes, headerOption } from "./interfaces.js";
import { Widget } from "./widget.js";

export class DraggableWidget extends Widget {
  private readonly container: HTMLDivElement;
  private readonly header: HTMLDivElement = null;
  private readonly body: HTMLDivElement;

  private draggable: Draggable = null;
  private doCursorDrag: boolean;
  private buttonHideTimeout: number = null;

  private readonly buttonColors = new Map<buttonTypes, {
    dormant: { fill: string, highlight: string }
    active: { fill: string, highlight: string },
  }>();

  constructor({
    id,layer,positioning,pos,style,
    header = null,
    doCursorDragIcon=true,
    options,
    content,
    name
  }: DraggableWidgetInterface) {
    const container = document.createElement("div");
    
    super({
      id,layer,positioning,pos,style,
      name,
      content: container
    });

    this.container = container;
    this.container.classList.add("framework-draggable-widget-containers")
    
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
        const options = ("buttons" in header ? header.buttons[type] : {}) as Partial<headerOption>;
        const defOptions = buttonDefaults[type] as headerOption;
        if (options?.show ?? defOptions.show) {
          const button = document.createElement("div");
          button.classList.add(`framework-draggable-widget-${type}s`, "framework-draggable-widget-buttons");
          button.setAttribute("title", type);
          this.buttonColors.set(type as buttonTypes, {
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
          this.updateButtonColor(button, type as buttonTypes, "dormant");
          button.addEventListener("mousedown", (e) => {
            e.stopPropagation(); // prevent dragging from button
            this.scene.layers.moveToTop(this); // still do select
          });

          // fetch svg data
          const src = `/module/icons/${options?.icon ?? defOptions.icon}`;
          fetch(src).then(async data => {
            const response = (await data.text()).replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,""); // replace removes script tags (like that injected by live-server)
            const doc = new DOMParser();
            const svg = doc.parseFromString(response, "image/svg+xml").querySelector("svg");
            button.append(svg);

            svg.style.width = options?.size ?? defOptions.size;
            svg.style.height = options?.size ?? defOptions.size;
          });

          switch (type as buttonTypes) {
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

      title.addEventListener("mouseenter", this.showButtons.bind(this));
      title.addEventListener("mouseleave", this.hideButtons.bind(this));
      titleEnd.addEventListener("mouseenter", this.showButtons.bind(this));
      titleEnd.addEventListener("mouseleave", this.hideButtons.bind(this));
    }
    
    this.body = document.createElement("div");
    this.body.classList.add("framework-draggable-widget-bodies");
    this.body.append(content);

    this.container.append(this.body);
  }

  setZoom(z: number) {
    super.setZoom(z); // just in case this is eventually implemented in parent class
    this.draggable?.setZoom(z);
  }

  attachTo(scene: Scene): void {
    super.attachTo(scene);

    if (this.header) {
      this.draggable = new Draggable({
        viewport: scene.element,
        element: [
          this.header.querySelector(".framework-draggable-widget-titles"),
          this.header.querySelector(".framework-draggable-widget-title-ends")
        ],
        periphery: [this.container],
        zoomable: false,
        blockScroll: false
      });
      this.draggable.offsetBy(this.pos.x, this.pos.y);

      this.draggable.listener.on("dragInit", this.dragInit.bind(this));
      this.draggable.listener.on("drag", this.drag.bind(this));
      this.draggable.listener.on("dragEnd", this.dragEnd.bind(this));
      this.draggable.listener.on("selected", () => { this.scene.layers.moveToTop(this); })
    }
  }

  protected dragInit() {
    if (this.doCursorDrag) this.header.classList.add("dragging");
  }

  protected dragEnd() {
    if (this.doCursorDrag) this.header.classList.remove("dragging");
  }

  protected drag(d: Draggable) {
    this.pos.x = -d.pos.x;
    this.pos.y = -d.pos.y;

    this.scene?.updateIndividualWidget(this);
  }

  protected minimize() {
    this.body.classList.toggle("draggable-widget-minimize");
  }

  protected close() {
    this.detachFrom(this.scene);
  }

  private showButtons() {
    if (this.buttonHideTimeout != null) { // stop timeout
      clearTimeout(this.buttonHideTimeout);
      this.buttonHideTimeout = null;
    }
    const title = this.header.querySelector<HTMLDivElement>(".framework-draggable-widget-titles");
    if (title.classList.contains("show-buttons")) return; // already shown

    title.classList.add("show-buttons");

    const toPad = title.querySelector<HTMLDivElement>(".framework-draggable-widget-button-holder").offsetWidth;
    const oldPad = +title.style.paddingRight.replace("px","") || 0;
    title.style.paddingRight = `${toPad + oldPad + 10}px`;
  }

  private hideButtons() {
    if (this.buttonHideTimeout != null) { // already working on hide
      this.buttonHideTimeout = null;
      return;
    }
    this.buttonHideTimeout = setTimeout(() => {
      this.buttonHideTimeout = null;
      if (this.body.classList.contains("draggable-widget-minimize")) return; // minimized, so keep
      const title = this.header.querySelector<HTMLDivElement>(".framework-draggable-widget-titles");
      title.classList.remove("show-buttons");
      title.style.paddingRight = ""; // remove bespoke styling
    }, 500);
  }

  private updateButtonColor(button: HTMLDivElement, type: buttonTypes, set: "dormant" | "active") {
    button.style.background = this.buttonColors.get(type)[set].highlight;
    button.style.fill = this.buttonColors.get(type)[set].fill;
  }
}