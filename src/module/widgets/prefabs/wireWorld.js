import { ConnectorAddon } from "../../addons/connector.js";
import { DraggableWidget } from "../draggable-widget.js";
export class WireWorldWidget extends DraggableWidget {
    constructor({ type, validator = null, wireData = null, color = "white" }) {
        super({
            name: "wire-world",
            header: {
                show: false
            },
            doDragAll: true,
            addons: {
                "top": {
                    side: "top",
                    addon: new ConnectorAddon({
                        direction: "omni",
                        type,
                        validator,
                        wireData
                    })
                },
                "bottom": {
                    side: "bottom",
                    addon: new ConnectorAddon({
                        direction: "omni",
                        type,
                        validator,
                        wireData
                    })
                },
                "left": {
                    side: "left",
                    addon: new ConnectorAddon({
                        direction: "omni",
                        type,
                        validator,
                        wireData
                    })
                },
                "right": {
                    side: "right",
                    addon: new ConnectorAddon({
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
//# sourceMappingURL=wireWorld.js.map