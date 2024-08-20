import { ConnectorAddon } from "../../addons/connector.js";
import { DraggableWidget } from "../draggable-widget.js";

export class WireWorldWidget extends DraggableWidget {
  constructor({
    type,
    validator = null,
    wireData = null,
    color = "white"
  }: {
    type: string,
    validator?: (addon1: "omni", addon2: "omni") => boolean
    wireData?: ConnectorAddon<any>["wireData"],
    color?: string
  }) {
    super({
      name: "wire-world",
      header: {
        show: false
      },
      doDragAll: true,
      addons: {
        "top": {
          side: "top",
          addon: new ConnectorAddon<"omni">({
            direction: "omni",
            type,
            validator,
            wireData
          })
        },
        "bottom": {
          side: "bottom",
          addon: new ConnectorAddon<"omni">({
            direction: "omni",
            type,
            validator,
            wireData
          })
        },
        "left": {
          side: "left",
          addon: new ConnectorAddon<"omni">({
            direction: "omni",
            type,
            validator,
            wireData
          })
        },
        "right": {
          side: "right",
          addon: new ConnectorAddon<"omni">({
            direction: "omni",
            type,
            validator,
            wireData
          })
        }
      }
    });

    this.body.style.background = color;

    this.addInitParams({ type, validator, wireData, color });
    this.defineObjectificationInitParams({ "wireData.type": "widget", "validator": "+" });
  }
}