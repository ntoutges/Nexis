// containers of everything--imagine this as the viewport

import { FrameworkBase } from "./framework.js";
import { DraggableEvents, SceneInterface, draggableListener } from "./interfaces.js";
import { Draggable } from "./draggable.js";
import { Listener } from "./listener.js";
import { Widget } from "./widgets/widget.js";

var sceneIdentifiers = 0;

export class Scene extends FrameworkBase {
  readonly draggable: Draggable;
  readonly identifier = sceneIdentifiers++;

  private readonly elListener = new Listener<string, Event>();
  private readonly widgets: Widget[] = [];

  constructor({
    id = null,
    parent = null,
    options = {},
    style,
    widgets = [],
    doStartCentered = false
  }: SceneInterface) {
    super({
      name: "scene",
      id, parent,
      style
    });

    this.draggable = new Draggable({
      viewport: this.element,
      element: parent,
      scrollX: options?.scrollX ?? true,
      scrollY: options?.scrollY ?? true,
      zoomable: options?.zoomable ?? true
    });

    for (const widget of widgets) {
      widget.attachTo(this);
      this.widgets.push(widget);
    }

    this.onD("drag", this.updateWidgetPosition.bind(this));
    this.onD("scroll", this.updateWidgetPositionAndScale.bind(this));
    if (doStartCentered) this.onD("init", this.centerScene.bind(this))
  }

  addWidget(widget: Widget) {
    widget.attachTo(this);
    this.widgets.push(widget);
  }

  removeWidget(widget: Widget) {
    widget.detachFrom(this);
    const index = this.widgets.indexOf(widget);
    if (index == -1) return; // widget doesn't exist in the scene
    this.widgets.splice(index,1); // remove widget from list
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
  if (widget.positioning == 0) return; // no point in trying to multiply by 0
    
    const [cX, cY] = this.draggable.toScreenSpace(
      widget.pos.x,
      widget.pos.y
    );

    const bounds = widget.calculateBounds(this.draggable.pos.z);
    const sX = cX * widget.positioning - widget.align.x * bounds.width;
    const sY = cY * widget.positioning - widget.align.y * bounds.height;
      
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

  protected centerScene(d: Draggable) {
    this.draggable.offsetBy(
      d.bounds.width / 2,
      d.bounds.height / 2
    );
  }
}