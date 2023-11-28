// basis for everything in the module

import { Draggable } from "./draggable.js";
import { FrameworkBaseInterface, resizeType } from "./interfaces.js";

export class FrameworkBase {
  protected el: HTMLDivElement = document.createElement("div");
  protected readonly resizeData: {
    option: resizeType,
    dragEl: HTMLDivElement,
    draggable: Draggable
  } = {
    option: null,
    dragEl: null,
    draggable: null
  }

  constructor({
    name,
    parent = null,
    id = null,
    children = [],
    style,
    resize = "none"
  }: FrameworkBaseInterface) {

    this.el.classList.add("frameworks");
    this.resizeData.option = resize;
    const names = name.split(" ");
    for (const partialName of names) {
      this.el.classList.add(`framework-${partialName}`);
    }

    if (id) this.el.setAttribute("id", id);

    for (const child of children) { this.el.append(child); }
    
    if (this.resizeData.option != "none") {
      this.resizeData.dragEl = document.createElement("div");
      this.resizeData.dragEl.classList.add("framework-resize-drag-element", `framework-dir-${this.resizeData.option}`);
      this.el.append(this.resizeData.dragEl);
    }
    
    if (parent) this.appendTo(parent);
    if (style) {
      for (const property in style) { this.el.style[property] = style[property]; }
    }
  }

  hide() { this.el.classList.add("hiddens"); }
  show() { this.el.classList.remove("hiddens"); }

  appendTo(parent: HTMLElement) {
    parent.append(this.el);
    if (this.resizeData.dragEl) {
      if (!this.resizeData.draggable) { // buld new draggable
        this.resizeData.draggable = new Draggable({
          viewport: parent,
          element: this.resizeData.dragEl,
          zoomable: false,
          scrollX: ["horizontal", "both"].includes(this.resizeData.option),
          scrollY: ["vertical", "both"].includes(this.resizeData.option),
          blockDrag: true,
          blockScroll: true
        });

        this.resizeData.draggable.listener.on("drag", this.manualResizeTo.bind(this));
        this.resizeData.draggable.listener.on("resize", () => {}); // force constant resize/scale calculation
      }
      else this.resizeData.draggable.changeViewport(parent); // modify old draggable
    }
  }

  get element() {
    return this.el;
  }

  private manualResizeTo(d: Draggable) {
    const newWidth = this.el.offsetWidth - d.delta.x;
    const newHeight = this.el.offsetHeight + d.delta.y;

    this.el.style.width = `${newWidth}px`;
    this.el.style.height = `${newHeight}px`;
  }
}