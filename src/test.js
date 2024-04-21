import { Scene } from "./module/scene.js";
import { GridWidget } from "./module/widgets/grid.js";
import { ConnectorAddon } from "./module/addons/connector.js";
import { PeerConnection } from "./connection/lib/distros/peer.js";
import { ConnConsole, ConnWidget } from "./module/widgets/prefabs/connWidget.js";
import { WireLine } from "./module/widgets/wire/line.js";
import { WireCatenary } from "./module/widgets/wire/catenary.js";
import { LocalConnection } from "./connection/lib/distros/local.js";
ConnectorAddon.setStyle("data", "input", { background: "white" });
ConnectorAddon.setStyle("data", "output", { background: "black" });
ConnectorAddon.setStyle("data", "omni", { background: "radial-gradient(black, black 50%, white 50%, white)" });
const $ = document.querySelector.bind(document);
const peerConn = new PeerConnection(Peer, "framework");
const localConn = new LocalConnection();
const scene = new Scene({
    parent: $("#sandbox"),
    style: {
        // width: "100vw",
        // height: "100vh",
        background: "white"
    },
    doStartCentered: true,
    options: {
        // scrollX: false,
        // scrollY: false
        zoom: {
            max: 1e2,
            min: 1e-2
        }
    },
    widgets: [
        new GridWidget({
            style: {
                background: "cornsilk"
            },
            options: {
                coords: true
            },
            doCursorDragIcon: true
        }),
        // new ConnWidget({
        //   type: "data",
        //   connections: {
        //     "peer": peerConn,
        //     "local": new LocalConnection()
        //   },
        //   validator: connValidator,
        //   wireData: {
        //     params: {},
        //     type: WireCatenary
        //   }
        // }),
        // new ConnWidget({
        //   type: "data",
        //   connections: {
        //     "peer": peerConn,
        //     "local": new LocalConnection()
        //   },
        //   validator: connValidator,
        //   wireData: {
        //     params: {},
        //     type: WireCatenary
        //   }
        // }),
        // new ConnWidget({
        //   type: "data",
        //   connections: {
        //     "peer": peerConn,
        //     "local": new LocalConnection()
        //   },
        //   validator: connValidator,
        //   wireData: {
        //     params: {},
        //     type: WireCatenary
        //   }
        // }),
        // new ConnWidget({
        //   type: "data",
        //   connections: {
        //     "peer": peerConn,
        //     "local": new LocalConnection()
        //   },
        //   validator: connValidator,
        //   wireData: {
        //     params: {},
        //     type: WireCatenary
        //   }
        // }),
        // new ConnConsole({
        //   type: "data",
        //   validator: connValidator,
        //   wireData: {
        //     params: {},
        //     type: WireCatenary
        //   }
        // }),
        // new ConnConsole({
        //   type: "data",
        //   validator: connValidator,
        //   wireData: {
        //     params: {},
        //     type: WireCatenary
        //   }
        // }),
        new ConnConsole({
            type: "data",
            validator: connValidator,
            wireData: {
                params: {},
                type: WireCatenary
            }
        })
    ]
});
function connValidator(dir1, dir2) {
    return (dir1 == "input" && dir2 == "output") || (dir1 == "output" && dir2 == "input") || (dir1 == "omni") || (dir2 == "omni");
}
scene.addLoadClass("widget", WireLine);
scene.addLoadClass("widget", ConnConsole);
scene.addLoadClass("widget", GridWidget);
scene.addLoadClass("widget", ConnWidget, {
    connections: {
        "peer": peerConn,
        "local": new LocalConnection()
    }
});
//# sourceMappingURL=test.js.map