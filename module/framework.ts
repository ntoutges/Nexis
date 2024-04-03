// basis for everything in the module

import { Draggable } from "./draggable.js";
import { FrameworkBaseInterface, resizeType } from "./interfaces.js";
import * as svg from "./svg.js"


export abstract class FrameworkBase {
  protected el: HTMLDivElement = document.createElement("div");
  protected readonly resizeData: {
    option: resizeType,
    dragEl: HTMLDivElement,
    draggable: Draggable
  } = {
      option: null,
      dragEl: null,
      draggable: null
    };
  private trackedDraggables: Draggable[] = [];
  private readonly initParams: Record<string,any> = {};

  constructor({
    name,
    parent = null,
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

    for (const child of children) { this.el.append(child); }

    if (this.resizeData.option != "none") {
      this.resizeData.dragEl = document.createElement("div");
      this.resizeData.dragEl.classList.add("framework-resize-drag-element", `framework-dir-${this.resizeData.option}`);
      this.el.append(this.resizeData.dragEl);

      let resizeTypeName = "both";
      if (resize == "horizontal") resizeTypeName = "width";
      else if (resize == "vertical") resizeTypeName = "height";
      svg.getSvg(`icons.resize-${resizeTypeName}`).then(svg => {
        this.resizeData.dragEl.append(svg);
      });
    }

    if (parent) this.appendTo(parent);
    if (style) {
      for (const property in style) { this.el.style[property] = style[property]; }
    }

    this.addInitParams({ name,style,resize });
  }

  hide() { this.el.classList.add("hiddens"); }
  show() { this.el.classList.remove("hiddens"); }

  addInitParams(params: Record<string,any>): void
  addInitParams(params: Record<string,any>, delParams: string[] | "*"): void
  addInitParams(params: Record<string,any>, delParams: string[] | "*" = null) {
    if (delParams !== null) this.delInitParams(delParams);

    for (const key in params) { this.initParams[key] = params[key]; }
  }

  delInitParams(params: string[] | "*") {
    if (params === "*") params = Object.keys(this.initParams); // remove all params
    for (const key of params) { delete this.initParams[key]; }
  }

  appendTo(parent: HTMLElement) {
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

        this.resizeData.draggable.listener.on("drag", this.manualResizeTo.bind(this));
        this.trackDraggables(this.resizeData.draggable);
      }
      else this.resizeData.draggable.changeViewport(parent); // modify old draggable
    }
  }

  get element() {
    return this.el;
  }

  protected manualResizeTo(d: Draggable) {
    const newWidth = this.el.offsetWidth - d.delta.x;
    const newHeight = this.el.offsetHeight + d.delta.y;

    this.el.style.width = `${newWidth}px`;
    this.el.style.height = `${newHeight}px`;

    d.listener.trigger("resize", d);

    // remove set width/height
    this.resetBounds();
  }

  resetBounds() {
    this.el.style.width = "";
    this.el.style.height = "";
  }

  protected trackDraggables(...draggables: Draggable[]) {
    this.trackedDraggables.push(...draggables);
  }
  protected untrackDraggable(draggable: Draggable) {
    const index = this.trackedDraggables.indexOf(draggable);
    if (index === -1) return false;
    this.trackedDraggables.splice(index, 1);
    return true;
  }
  updateTrackedDraggableScale(scale: number) {
    for (const draggable of this.trackedDraggables) {
      draggable.scale = scale;
    }
  }

  save(): Record<string, any> {
    return {
      params: this.initParams
    };
  };
}
