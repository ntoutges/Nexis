import { Addon } from "../addons/addons.js";
import { AttachableListener } from "../attachableListener.js";
import { WIRE_LAYER } from "../layer-info.js";
import { Listener } from "../listener.js";
import { Widget } from "./widget.js";

export class WirePoint {
  protected x: number = 0;
  protected y: number = 0;
  protected addon: Addon;
  protected addonListener = new AttachableListener<"positioning" | "weight" | "size" | "move",Addon>(() => this.addon?.listener);
  readonly listener = new Listener<"move", { x: number, y: number }>();

  constructor() {
    // setTimeout to allow position to update after scene position updates (Thanks to JS event system!)
    this.addonListener.on("move", () => { setTimeout(this.updatePosition.bind(this), 0)});
  }

  attachToAddon(addon: Addon) {
    this.addon = addon;
    this.addonListener.updateValidity();
    this.updatePosition();
  }
  
  protected updatePosition() {
    const pos = this.addon?.getPositionInScene();
    if (!pos) return; // invalid (this.addon not yet set, or addon not part of scene)
    this.setPos(pos[0], pos[1]);
  }

  setPos(
    x: number,
    y: number
  ) {
    this.x = x;
    this.y = y;
    this.listener.trigger("move", this.getPos());
  }

  getPos() {
    return {
      x: this.x,
      y: this.y
    };
  }
}

export class BasicWire extends Widget { 
  readonly point1 = new WirePoint();
  readonly point2 = new WirePoint();

  constructor() {
    super({
      content: document.createElement("div"),
      name: "basic-wire",
      layer: WIRE_LAYER
    });

    this.point1.listener.on("move", this.updateElementTransformations.bind(this));
    this.point2.listener.on("move", this.updateElementTransformations.bind(this));
  }

  getPolar() {
    const dx = this.point2.getPos().x - this.point1.getPos().x;
    const dy = this.point2.getPos().y - this.point1.getPos().y;

    const mag = Math.sqrt( dx*dx + dy*dy );
    const rot = Math.atan2(dy, dx);
    return { mag, rot };
  }

  protected updateElementTransformations() {
    const { mag,rot } = this.getPolar();

    const pos = this.point1.getPos();
    this.setPos(pos.x, pos.y);

    this.el.style.width = `${mag}px`;
    this.el.style.transform = `translateY(-50%) rotate(${rot}rad)`;
  }

  setIsEditing(isEditing: boolean) {
    // changes styling slightly to make editing wire easier
    this.el.classList.toggle("framework-wire-is-editing", isEditing);
  }
}