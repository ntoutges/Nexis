// containers of everything--imagine this as the viewport

import { FrameworkBase } from "./framework.js";
import { DraggableEvents, SceneInterface, draggableListener } from "./interfaces.js";
import { Draggable } from "./draggable.js";
import { Listener } from "./listener.js";
import { Layers } from "./widgets/layers.js";
import { GlobalSingleUseWidget, Widget } from "./widgets/widget.js";
import { Grid, Pos } from "./pos.js";

var sceneIdentifiers = 0;

export class Scene extends FrameworkBase {
  readonly draggable: Draggable;
  readonly identifier = sceneIdentifiers++;

  private readonly elListener = new Listener<string, Event>();
  private readonly widgets: Widget[] = [];

  private readonly snapObjects = new Map<number,Pos<"x"|"y"> | Grid<"x"|"y">>();
  private nextSnapObjectId: number = 0;

  readonly layers = new Layers<Widget>();

  constructor({
    id = null,
    parent = null,
    options = {},
    style,
    widgets = [],
    doStartCentered = false,
    resize
  }: SceneInterface) {
    super({
      name: "scene",
      id, parent,
      style,
      resize
    });

    this.draggable = new Draggable({
      viewport: this.element,
      element: parent,
      scrollX: options?.scrollX ?? true,
      scrollY: options?.scrollY ?? true,
      zoomable: options?.zoom?.able ?? true,
      options: {
        zoom: {
          max: options?.zoom?.max ?? Number.MAX_VALUE,
          min: options?.zoom?.min ?? 0
        }
      }
    });

    this.layers.onMove((type, zIndex) => { type.setZIndex(zIndex); });
    for (const widget of widgets) {
      this.addWidget(widget);
    }

    this.onD("drag", this.updateWidgetPosition.bind(this));
    this.onD("scroll", this.updateWidgetPositionAndScale.bind(this));
    if (doStartCentered) this.onD("init", this.centerScene.bind(this));
    this.onE("mousedown", () => { GlobalSingleUseWidget.unbuildType("contextmenu"); })
  }

  addWidget(widget: Widget) {
    widget.attachTo(this);
    this.widgets.push(widget);
    this.layers.add(widget);

    for (const snapObj of this.snapObjects.values()) { widget.pos.addSnapObject(snapObj); } // add snap objects
  }

  removeWidget(widget: Widget) {
    const index = this.widgets.indexOf(widget);
    if (index == -1) return; // widget doesn't exist in the scene
    this.widgets.splice(index,1); // remove widget from list
    this.layers.remove(widget);
    widget.detachFrom(this);

    for (const snapObj of this.snapObjects.values()) { widget.pos.removeSnapObject(snapObj); } // remove snap objects
  }

  /**
   * On (E)lement event
   */
  onE(type: string, listener: (e: Event) => void) {
    if (!this.elListener.isListeningTo(type)) { // trigger elListener whenever event happens
      this.el.addEventListener(type, (e) => { this.elListener.trigger(type, e); });
    }
    const id = this.elListener.on(type, listener); // trigger outer listener that event has happened
    this.elListener.doSync(this.draggable.listener);
    return id;
  }

  /**
   * On (D)raggable event
   */
  onD(type: DraggableEvents, listener: draggableListener) {
    const id = this.draggable.listener.on(type, listener);
    this.draggable.listener.doSync(this.elListener);
    return id;
  }

  off(id: number) {
    if (this.elListener.hasListenerId(id)) return this.elListener.off(id);
    else if (this.draggable.listener.hasListenerId(id)) return this.draggable.listener.off(id);
    return false;
  }

  updateIndividualWidget(widget: Widget) {
    if (!this.widgets.includes(widget)) return; // don't try to update invalid widget
    this.updateIndividualWidgetPosition(widget);
  }

  protected updateIndividualWidgetPosition(widget: Widget) {
    if (!widget.isBuilt) return;

    const widgetX = widget.pos.getPosComponent("x");
    const widgetY = widget.pos.getPosComponent("y");

    const [cX1, cY1] = this.draggable.toScreenSpace(
      widgetX,
      widgetY
    );

    const cX = widgetX * (1-widget.positioning) + cX1 * widget.positioning;
    const cY = widgetY * (1-widget.positioning) + cY1 * widget.positioning;
      
    const [x,y] = this.draggable.toScreenSpace(0,0);

    const offX = cX - x*widget.positioning;
    const offY = cY - y*widget.positioning;
    
    const bounds = widget.calculateBounds(this.draggable.pos.z);
    const sX = x * widget.positioning + offX - widget.align.x * bounds.width;
    const sY = y * widget.positioning + offY - widget.align.y * bounds.height;
      
    // outside viewable bounds
    if (
      sX + bounds.width <= 0
      || sX >= this.draggable.bounds.width
      || sY + bounds.height <= 0
      || sY >= this.draggable.bounds.height
    ) {
      widget.element.classList.add("hidden"); // hide element to save on processing (I hope)
      return;
    }
    else widget.element.classList.remove("hidden");

    widget.element.style.left = `${sX}px`;
    widget.element.style.top = `${sY}px`;
  }

  protected updateWidgetPosition() {
    for (const widget of this.widgets) {
      this.updateIndividualWidgetPosition(widget);
    }
  }

  protected updateWidgetPositionAndScale() {
    this.updateWidgetPosition();

    for (const widget of this.widgets) {
      if (widget.positioning == 0) continue; // no point in trying to multiply by 0
      const scale = (this.draggable.pos.z * widget.positioning) + 1 * (1-widget.positioning);
      widget.setTransformation("scale", scale.toString());
      widget.setZoom(this.draggable.pos.z);
    }
  }

  setWidgetPos(
    widget: Widget,
    x: number,
    y: number
  ) {
    if (!this.widgets.includes(widget)) return;
    const [sX, sY] = this.draggable.toSceneSpace(x,y);
    widget.setPos( sX, sY );
    this.updateIndividualWidget(widget);
  }

  protected centerScene(d: Draggable) {
    this.draggable.offsetBy(
      d.bounds.width / 2,
      d.bounds.height / 2
    );
  }

  addGlobalSnapObject(obj: Grid<"x"|"y"> | Pos<"x"|"y">): number {
    for (const widget of this.widgets) {
      widget.pos.addSnapObject(obj);
    }

    const id = this.nextSnapObjectId++;
    this.snapObjects.set(id,obj);
    return id;
  }
  removeGlobalSnapObject(obj: number | Grid<"x"|"y"> | Pos<"x"|"y">) {
    if (typeof obj == "number") obj = this.snapObjects.get(obj);
    for (const widget of this.widgets) {
      widget.pos.removeSnapObject(obj);
    }

    let id = -1;
    for (const [i,snapObj] of this.snapObjects.entries()) {
      if (snapObj == obj) {
        id = i;
        break;
      }
    }
    if (id == -1) return false; // doesn't exist
    this.snapObjects.delete(id);
    return true; // exists
  }
}