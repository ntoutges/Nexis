import { Scene } from "./module/scene.js";
import { GridWidget } from "./module/widgets/grid.js";
import { ConnectorAddon } from "./module/addons/connector.js";
import { PeerConnection } from "./connection/lib/distros/peer.js";
import { ConnConsole, ConnWidget } from "./module/widgets/prefabs/connWidget.js";
ConnectorAddon.setStyle("data", "input", { background: "white" });
ConnectorAddon.setStyle("data", "output", { background: "black" });
ConnectorAddon.setStyle("data", "omni", { background: "radial-gradient(black, black 50%, white 50%, white)" });
const $ = document.querySelector.bind(document);
new Scene({
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
        new ConnWidget({
            wireType: "data",
            connections: { "peer": new PeerConnection(Peer, "fw") }
        }),
        new ConnWidget({
            wireType: "data",
            connections: { "peer": new PeerConnection(Peer, "fw") }
        }),
        new ConnConsole({
            wireType: "data"
        }),
        new ConnConsole({
            wireType: "data"
        })
    ]
});
function connValidator(dir1, dir2) {
    return (dir1 == "input" && dir2 == "output") || (dir1 == "output" && dir2 == "input") || (dir1 == "omni") || (dir2 == "omni");
}
//# sourceMappingURL=test.js.map