// containers of everything--imagine this as the viewport

import { FrameworkBase } from "./framework.js";
import { DraggableEvents, SceneInterface, draggableListener } from "./interfaces.js";
import { Draggable } from "./draggable.js";
import { ElementListener, Listener } from "./listener.js";
import { Layers } from "./layers.js";
import { GlobalSingleUseWidget, Widget } from "./widgets/widget.js";
import { Grid, Pos } from "./pos.js";
import { BasicWire } from "./widgets/wire.js";

var sceneIdentifiers = 0;

export class Scene extends FrameworkBase {
  readonly draggable: Draggable;
  readonly identifier = sceneIdentifiers++;

  readonly elListener = new Listener<string, Event>();
  readonly resizeListener = new ElementListener<void>();
  readonly interListener = new Listener<string, any>();
  readonly bounds = new Pos<"x"|"y">({});

  private readonly widgets: Widget[] = [];

  private readonly snapObjects = new Map<number,Pos<"x"|"y"> | Grid<"x"|"y">>();
  private nextSnapObjectId: number = 0;

  readonly layers = new Layers<Widget>();
  private readonly wires = new Set<BasicWire>();

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

    this.draggable.listener.on("drag", this.updateWidgetPosition.bind(this));
    this.draggable.listener.on("scroll", this.updateWidgetPositionAndScale.bind(this));
    if (doStartCentered) this.draggable.listener.on("init", this.center.bind(this));

    this.elListener.onListen((type, isNew) => {
      if (isNew) this.el.addEventListener(type, this.elListener.trigger.bind(this.elListener, type));
    });
    this.elListener.on("mousedown", () => { GlobalSingleUseWidget.unbuildType("contextmenu"); })

    this.resizeListener.observe(this.el);
    this.resizeListener.on("resize", () => {
      const boundingRect = this.el.getBoundingClientRect();
      this.bounds.setPos({ x: boundingRect.width, y: boundingRect.height });

      this.elListener.trigger("resize", new Event("resize", {}));
    });
  }

  addWidget(widget: Widget) {
    widget.attachTo(this);
    this.widgets.push(widget);
    this.layers.add(widget);

    this.updateIndividualWidget(widget);
    for (const snapObj of this.snapObjects.values()) { widget.pos.addSnapObject(snapObj); } // add snap objects
  }

  removeWidget(widget: Widget) {
    const index = this.widgets.indexOf(widget);
    if (index == -1) return; // widget doesn't exist in the scene
    this.widgets.splice(index,1); // remove widget from list
    this.layers.remove(widget);
    widget.detachFrom(this);

    if (widget instanceof BasicWire && this.wires.has(widget)) this.wires.delete(widget); // stop tracking wire

    for (const snapObj of this.snapObjects.values()) { widget.pos.removeSnapObject(snapObj); } // remove snap objects
  }

  updateIndividualWidget(widget: Widget) {
    if (!this.widgets.includes(widget)) return; // don't try to update invalid widget
    this.updateIndividualWidgetPosition(widget);
    this.updateIndividualWidgetScale(widget);
  }

  protected updateIndividualWidgetPosition(widget: Widget) {
    if (!widget.isBuilt || widget.positioning === 0) return; // if positioning is 0 (doesn't move), then ignore

    const {x,y} = widget.pos.getPosData(["x","y"]);
      
    const sWidth = widget.bounds.getPosComponent("x");
    const sHeight = widget.bounds.getPosComponent("y");
    const width = this.draggable.scaleIntoScreenSpace(sWidth);
    const height = this.draggable.scaleIntoScreenSpace(sHeight);

    const [sX, sY] = this.draggable.toScreenSpace(x, y);

    const viewWidth = this.bounds.getPosComponent("x");
    const viewHeight = this.bounds.getPosComponent("y");
    
    // outside viewable bounds
    if (
      sX + width < 0
      || sX > viewWidth
      || sY + height < 0
      || sY > viewHeight
    ) {
      widget.element.classList.add("hidden"); // hide element to save on processing (I hope)
    }
    else widget.element.classList.remove("hidden");

    widget.element.style.left = `${sX}px`;
    widget.element.style.top = `${sY}px`;
  }

  protected updateIndividualWidgetScale(widget: Widget) {
    if (widget.positioning == 0) return; // no point in trying to multiply by 0
      const scale = (this.draggable.pos.z * widget.positioning) + 1 * (1-widget.positioning);
      widget.setTransformation("scale", scale.toString());
      widget.setZoom(this.draggable.pos.z);
  }

  protected updateWidgetPosition() {
    for (const widget of this.widgets) {
      this.updateIndividualWidgetPosition(widget);
    }
  }

  protected updateWidgetScale() {
    for (const widget of this.widgets) {
      this.updateIndividualWidgetScale(widget);
    }
  }

  protected updateWidgetPositionAndScale() {
    this.updateWidgetPosition();
    this.updateWidgetScale();
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

  center() {
    const bounds = this.bounds.getPosData(["x","y"]);
    this.draggable.setOffsetTo(
      bounds.x / 2,
      bounds.y / 2
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

  registerWire(wire: BasicWire) {
    this.wires.add(wire); // track wire
  }
}