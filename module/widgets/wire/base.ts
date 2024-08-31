import { Addon } from "../../addons/base.js";
import { ConnectorAddon } from "../../addons/connector.js";
import { AttachableListener } from "../../attachableListener.js";
import { WIRE_LAYER } from "../../layer-info.js";
import { Listener } from "../../listener.js";
import { Scene, idMap_t } from "../../scene.js";
import { Widget } from "../widget.js";

export class WirePoint {
  protected x: number = 0;
  protected y: number = 0;
  protected _addon: Addon;
  readonly addonListener = new AttachableListener<"positioning" | "weight" | "size" | "move" | "open" | "close" | "dragend" | "draginit", Addon>(() => this._addon?.listener);
  readonly listener = new Listener<"move" | "send" | "receive" | "disconnect", any>();

  constructor() {
    // setTimeout to allow position to update after scene position updates (Thanks to JS event system!)
    this.addonListener.on("move", () => { setTimeout(this.updatePosition.bind(this), 0)});
  }

  attachToAddon(addon: ConnectorAddon<any>) {
    this.listener.trigger("disconnect", this); // detach from any current addon

    this._addon = addon;
    this.addonListener.updateValidity();
    this.updatePosition();
  }

  get addon() { return this._addon; }
  get normal(): { x: -1 | 0 | 1, y: -1 | 0 | 1 } { return this._addon ? this._addon.normal : { x: 0, y: 0 }; }
  get radius() { return this._addon ? this._addon.size/2 : 0; }
  
  protected updatePosition() {
    const pos = this._addon?.getPositionInScene();
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

  save() {
    return this._addon ? {
      addon: this._addon.saveRef(),
      hasAddon: true
    } : {
      x: this.x,
      y: this.y,
      hasAddon: false
    };
  }

  load(data: ReturnType<this["save"]> & idMap_t, wire: WireBase) {
    if (data.hasAddon) {
      const widget = wire.scene.getWidgetById(data._idMap.translate(data.addon.widget));
      const addon = widget.addons.getEdge(data.addon.edge).get(data.addon.id) as ConnectorAddon<any>;
      this.attachToAddon(addon);
      addon.setPoint(wire, this);
    }
    else {
      this.setPos(
        data.x,
        data.y
      );
    }
  }
}

export interface CommonWireConstructor {
  width?: number
  color?: string
  shadow?: string
}

export abstract class WireBase extends Widget { 
  readonly point1 = new WirePoint();
  readonly point2 = new WirePoint();
  readonly wireEl: HTMLDivElement;

  protected _width: number;
  protected _color: string;
  protected _shadow: string;

  constructor({
    name,
    width = 2,
    color = "black",
    shadow = "white",
    pointerless = false
  }: CommonWireConstructor & {
    name: string
    pointerless?: boolean
  }) {
    const wireEl = document.createElement("div");

    super({
      content: wireEl,
      name: `basic-wire ${name}`,
      layer: WIRE_LAYER,
      contextmenu: {
        "conn": {
          el: wireEl,
          options: "delete/Remove Connection/icons.trash"
        }
      }
    });

    this._width = Math.max(width,0);
    this._color = color;
    this._shadow = shadow;
    setTimeout(this.updateWireStyle.bind(this), 1); // allow constructor of subclass to finish before running update

    this.addInitParams({ width, color, shadow, pointerless }, "*");

    this.wireEl = wireEl;
    this.wireEl.classList.add("nexis-wire-body");
    this.wireEl.classList.toggle("nexis-wire-body-pointerless", pointerless);

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

    this.elListener.on("detach", () => {
      // this.point1.addon?.listener.trigger("close", this.point1.addon);
      // this.point2.addon?.listener.trigger("close", this.point2.addon);
      this.disconnect();
    });
  }

  protected abstract updateElementTransformations(): void;
  protected abstract updateWireStyle(): void;

  setIsEditing(isEditing: boolean) {
    // changes styling slightly to make editing wire easier
    this.el.classList.toggle("nexis-wire-is-editing", isEditing);
  }

  disconnect() {
    this.point1.attachToAddon(null);
    this.point2.attachToAddon(null);
    this._scene?.removeWidget(this); // wire no longer connects anything, so remove it
  }

  // override updateBounds with different dimensions
  updateBounds() {
    const bounds = { width: this.el.offsetWidth, height: this.el.offsetHeight };
    const padding = this.point1.radius + this.point2.radius;
    super.updateBounds(bounds, { x: padding, y: padding });
  }

  save() {
    this.setDependencies(
      this.point1.addon?.addonContainer.widget.getId() ?? null,
      this.point2.addon?.addonContainer.widget.getId() ?? null
    )
    return {
      ...super.save(),
      wire: {
        point1: this.point1.save(),
        point2: this.point2.save()
      }
    }
  }

  load(data: ReturnType<this["save"]> & idMap_t) {
    this.point1.load({ ...data.wire.point1, _idMap: data._idMap }, this);
    this.point2.load({ ...data.wire.point2, _idMap: data._idMap }, this);
  }
  
  doSaveWidget() { return !!this.point1.addon && !!this.point2.addon; }
}

