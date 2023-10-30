// allows scenes to be moved around

import { DraggableEvents, ScrollableInterface as DraggableInterface, draggableListener } from "./interfaces.js";
import { Listener } from "./listener.js";

export class Draggable {
  private isDragging: boolean = false;
  private readonly element: HTMLElement;
  
  // measured in px
  private readonly mouseOffset = { x: 0, y: 0 };
  readonly pos = { x: 0, y: 0, z: 1 }; // z represents (z)oom
  readonly delta = { x: 0, y: 0, z: 0 };
  readonly bounds = { width: 0, height: 0 };

  private scrollX: boolean;
  private scrollY: boolean;
  private zoomable: boolean;
  private blockDrag: boolean;
  private blockScroll: boolean;

  readonly listener = new Listener<DraggableEvents, Draggable>();

  constructor({
    viewport, // continues movement
    element, // Initiates movement
    periphery = [], // Has event listener, but only to stop propagation
    scrollX = true,
    scrollY = true,
    zoomable = true,
    blockDrag = true,
    blockScroll = true
  }: DraggableInterface) {
    this.blockDrag = blockDrag;
    this.blockScroll = blockScroll;

    setTimeout(() => { // force this to run after rest of parent object has finished initializing
      element.addEventListener("mousedown", this.initDrag.bind(this));
      viewport.addEventListener("mousemove", this.doDrag.bind(this));
      viewport.addEventListener("mouseup", this.endDrag.bind(this));
      element.addEventListener("wheel", this.onScroll.bind(this));

      for (const el of periphery) {
        if (this.blockDrag) el.addEventListener("mousedown", (e) => { e.stopPropagation(); });
        if (this.blockScroll) el.addEventListener("wheel", (e) => { e.stopPropagation(); });
      }

      this.updateBounds();
      this.listener.setAutoResponse("init", this);
    }, 1);
    // element.addEventListener("mouseleave", this.endDrag.bind(this));

    this.scrollX = scrollX;
    this.scrollY = scrollY;
    this.zoomable = zoomable;

    this.element = element;

    this.listener.setPollingOptions("resize", this.updateBounds.bind(this));
  }

  protected initDrag(e: MouseEvent) {
    if (this.blockDrag) e.stopPropagation();
    e.preventDefault();
    this.isDragging = true;
    this.mouseOffset.x = e.pageX;
    this.mouseOffset.y = e.pageY;
    this.listener.trigger("dragInit", this);
  }
  protected doDrag(e: MouseEvent) {
    if (!this.isDragging) return;
    if (this.blockDrag) e.stopPropagation();
    
    let didMove = false;
    if (this.scrollX) {
      this.delta.x = (this.mouseOffset.x - e.pageX) / this.pos.z;
      if (this.delta.x != 0) didMove = true;
      this.pos.x += this.delta.x;
      this.mouseOffset.x = e.pageX;
    }
    if (this.scrollY) {
      this.delta.y = (e.pageY - this.mouseOffset.y) / this.pos.z;
      if (this.delta.y != 0) didMove = true;
      this.pos.y -= this.delta.y;
      this.mouseOffset.y = e.pageY;
    }

    if (didMove) {
      this.delta.z = 0;
      this.listener.trigger("drag", this);
    }
  }
  protected endDrag(e: MouseEvent) {
    if (!this.isDragging) return;
    if (this.blockDrag) e.stopPropagation();
    this.isDragging = false;
    this.listener.trigger("dragEnd", this);
  }

  protected onScroll(e: WheelEvent) {
    if (!this.zoomable || e.deltaY == 0) return; // don't zoom if not zoomable
    if (this.blockScroll) e.stopPropagation();

    // exact position of cursor actually matters here, rather than just difference in position
    const bounds = this.element.getBoundingClientRect();
    const localX = e.pageX - bounds.left;
    const localY = e.pageY - bounds.top;

    const dir = (e.deltaY > 0) ? 1 : -1;

    this.pos.x += localX / this.pos.z;
    this.pos.y += localY / this.pos.z;
    this.pos.z -= this.pos.z / (dir * 20);
    this.pos.x -= localX / this.pos.z;
    this.pos.y -= localY / this.pos.z;

    this.listener.trigger("scroll", this);
  }

  protected updateBounds() {
    const width = this.element.offsetWidth;
    const height = this.element.offsetHeight

    if (width == this.bounds.width && height == this.bounds.height) return null; // no difference
    this.bounds.width = width;
    this.bounds.height = height;
    return this; // truthy/there *was* a difference
  }

  offsetBy(
    x: number,
    y: number
  ) {
    this.pos.x -= Math.round(x);
    this.pos.y -= Math.round(y);
    this.listener.trigger("drag", this);
  }

  setZoom(z: number) {
    this.pos.z = z;
  }

  // convert x,y in screen to x,y within transformations of scene
  toSceneSpace(
    x: number,
    y: number
  ): [x: number, y: number] {
    return [
      x/this.pos.z + this.pos.x,
      y/this.pos.z + this.pos.y
    ];
  }

  // convert x,y in scene out to to x,y without scene transformations
  toScreenSpace(
    x: number,
    y: number
  ): [x: number, y: number] {
    return [
      (x - this.pos.x) * this.pos.z,
      (y - this.pos.y) * this.pos.z
    ];
  }
}
