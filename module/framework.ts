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
      if (this.resizeData.option == "horizontal" || this.resizeData.option == "both") {
        this.createResizeElement("left");
        this.createResizeElement("right");
      }
      if (this.resizeData.option == "vertical" || this.resizeData.option == "both") {
        this.createResizeElement("top");
        this.createResizeElement("bottom");
      }

      if (this.resizeData.option == "both") {
        this.createResizeElement("top","left");
        this.createResizeElement("top","right");
        this.createResizeElement("bottom","left");
        this.createResizeElement("bottom","right");
      }
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

        this.resizeData.draggable.listener.on("drag", (draggable) => {
          const resizeEl = draggable.lastEvent.target as HTMLDivElement;
          
          // components give: 0 for no movement; >=1 for scaling, >=2 for moving scaling
          const xComponent = +resizeEl.classList.contains("framework-resize-drag-element-side-right") + 2 *+resizeEl.classList.contains("framework-resize-drag-element-side-left");
          const yComponent = +resizeEl.classList.contains("framework-resize-drag-element-side-bottom") + 2*+resizeEl.classList.contains("framework-resize-drag-element-side-top");

          this.manualResizeTo(draggable, xComponent, yComponent);
        });
        // this.resizeData.draggable.listener.on("drag", this.manualResizeTo.bind(this));
        this.trackDraggables(this.resizeData.draggable);
      }
      else this.resizeData.draggable.changeViewport(parent); // modify old draggable
    }
  }

  get element() {
    return this.el;
  }

  protected manualResizeTo(
    d: Draggable,
    xComponent: number = 1,
    yComponent: number = 1
  ) {
    let dWidth = d.delta.x;
    let dHeight = d.delta.y;

    if (xComponent == 0) dWidth = 0;
    else if (xComponent >= 2) dWidth *= -1; // resize + move
    if (yComponent == 0) dHeight = 0;
    else if (yComponent >= 2) dHeight *= -1; // resize + move

    const newWidth = this.el.offsetWidth - dWidth;
    const newHeight = this.el.offsetHeight + dHeight;

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

  private createResizeElement(...sides: Array<"left" | "right" | "top" | "bottom">) {
    if (!this.resizeData.dragEl) {
      this.resizeData.dragEl = document.createElement("div");
      this.resizeData.dragEl.classList.add("framework-resize-drag-container");
      this.el.append(this.resizeData.dragEl);
    }
    
    const resizeEl = document.createElement("div");
    resizeEl.classList.add("framework-resize-drag-element");

    // const isHorizontal = sides.includes("left") || sides.includes("right");
    // const isVertical = sides.includes("top") || sides.includes("bottom");
    // let iconDir: "both" | "width" | "height" = "both";
    // if (!isVertical) iconDir = "width"
    // else if (!isHorizontal) iconDir = "height";

    // svg.getSvg(`icons.resize-${iconDir}`).then(svg => { resizeEl.append(svg); });

    for (const side of sides) { resizeEl.classList.add(`framework-resize-drag-element-side-${side}`); }
    this.resizeData.dragEl.append(resizeEl);
    return resizeEl;
  }

  save(): Record<string, any> {
    return {
      params: this.initParams
    };
  };
}
