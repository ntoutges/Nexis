import { Addon } from "../addons/addons.js";
import { ConnectorAddon } from "../addons/connector.js";
import { AttachableListener } from "../attachableListener.js";
import { WIRE_LAYER } from "../layer-info.js";
import { Listener } from "../listener.js";
import { Widget } from "./widget.js";

export class WirePoint {
  protected x: number = 0;
  protected y: number = 0;
  protected addon: Addon;
  readonly addonListener = new AttachableListener<"positioning" | "weight" | "size" | "move" | "close", Addon>(() => this.addon?.listener);
  readonly listener = new Listener<"move" | "send" | "receive" | "disconnect", any>();

  constructor() {
    // setTimeout to allow position to update after scene position updates (Thanks to JS event system!)
    this.addonListener.on("move", () => { setTimeout(this.updatePosition.bind(this), 0)});
  }

  attachToAddon(addon: ConnectorAddon<any>) {
    this.listener.trigger("disconnect", this); // detach from any current addon

    this.addon = addon;
    this.addonListener.updateValidity();
    this.updatePosition();
  }

  get normal() { return this.addon ? this.addon.normal : { x:0, y:0 }; }
  get radius() { return this.addon ? this.addon.size/2 : 0; }
  
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
  readonly wireEl: HTMLDivElement;

  constructor() {
    const wireEl = document.createElement("div");

    super({
      content: wireEl,
      name: "basic-wire",
      layer: WIRE_LAYER,
      contextmenu: {
        "conn": {
          el: wireEl,
          options: "delete/Remove Connection/icons.trash"
        }
      }
    });

    this.wireEl = wireEl;
    this.wireEl.classList.add("framework-basic-wire-body");

    this.point1.listener.on("move", this.updateElementTransformations.bind(this));
    this.point2.listener.on("move", this.updateElementTransformations.bind(this));

    this.point1.listener.on("send", this.point2.listener.trigger.bind(this.point2.listener, "receive")); // forward from point1 to point2
    this.point2.listener.on("send", this.point1.listener.trigger.bind(this.point1.listener, "receive")); // forward from point2 to point1

    // if either point is about to be removed, remove the wire
    this.point1.addonListener.on("close", this.disconnect.bind(this));
    this.point2.addonListener.on("close", this.disconnect.bind(this));

    this.contextmenus.conn.listener.on("click", (item) => {
      switch (item.value) {
        case "delete":
          this.disconnect();
          break;
      }
    });
  }

  getPolar() {
    const dx = this.point2.getPos().x - this.point1.getPos().x;
    const dy = this.point2.getPos().y - this.point1.getPos().y;
    
    const mag = Math.sqrt( dx*dx + dy*dy );
    const rot = Math.atan2(dy, dx);
    return { mag, rot };
  }

  protected updateElementTransformations() {
    if (!this.scene) return;
    let { mag,rot } = this.getPolar();
    
    // this allows the wire to not overlap addon
    const r1 = this.point1.radius
    const r2 = this.point2.radius
    mag = Math.max(mag-(r1+r2), 0);
    
    const pos1 = this.point1.getPos();
    const pos2 = this.point2.getPos();

    // ensure x/y is always at top-left
    const minX = Math.min(pos1.x, pos2.x);
    const minY = Math.min(pos1.y, pos2.y);

    this.setPos( minX,minY );
    
    this.wireEl.style.top = `${pos1.y - minY}px`;
    this.wireEl.style.left = `${pos1.x - minX}px`;

    this.wireEl.style.width = `${mag}px`;
    this.wireEl.style.transform = `translateY(-50%) rotate(${rot}rad) translateX(${r1}px)`;
  }

  setIsEditing(isEditing: boolean) {
    // changes styling slightly to make editing wire easier
    this.el.classList.toggle("framework-wire-is-editing", isEditing);
  }

  disconnect() {
    this.point1.attachToAddon(null);
    this.point2.attachToAddon(null);
    this._scene?.removeWidget(this); // wire no longer connects anything, so remove it
  }

  // override updateBounds with different dimensions
  updateBounds() {
    const bounds = { width: this.wireEl.offsetWidth, height: this.wireEl.offsetHeight };
    const padding = this.point1.radius + this.point2.radius;
    super.updateBounds(bounds, { x: padding, y: padding });
  }
}