import { Scene } from "./module/scene.js";
import { GridWidget } from "./module/widgets/grid.js";
import { ConnectorAddon } from "./module/addons/connector.js";
import { BasicWire } from "./module/widgets/wire.js";
import { ConnConsole, ConnWidget } from "./module/widgets/prefabs/connWidget.js";
ConnectorAddon.setStyle("data", "input", { background: "white" });
ConnectorAddon.setStyle("data", "output", { background: "black" });
ConnectorAddon.setStyle("data", "omni", { background: "radial-gradient(black, black 50%, white 50%, white)" });
const $ = document.querySelector.bind(document);
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
        //   wireType: "data",
        //   connections: { "peer": new PeerConnection(Peer, "fw") },
        //   validator: connValidator
        // }),
        // new ConnWidget({
        //   wireType: "data",
        //   connections: { "peer": new PeerConnection(Peer, "fw") },
        //   validator: connValidator
        // }),
        new ConnConsole({
            wireType: "data",
            validator: connValidator
        }),
        new ConnConsole({
            wireType: "data",
            validator: connValidator
        })
        // new DraggableWidget({
        //   name: "addonTest",
        //   header: {
        //     title: "Addon Test"
        //   },
        //   style: {
        //     width: "200px",
        //     height: "50px"
        //   },
        //   addons: {
        //     "l1": {
        //       side: "bottom",
        //       addon: new Addon({
        //         content: document.createElement("h1"),
        //         size: 30
        //       })
        //     },
        //     "l2": {
        //       side: "bottom",
        //       addon: new Addon({
        //         content: document.createElement("div"),
        //         weight: 10000000
        //       })
        //     },
        //     "l3": {
        //       side: "bottom",
        //       addon: new Addon({
        //         content: document.createElement("div"),
        //         weight: 10000
        //       })
        //     },
        //     "l4": {
        //       side: "bottom",
        //       addon: new Addon({
        //         content: document.createElement("h1")
        //       })
        //     }
        //   },
        //   resize: "both"
        // })
    ]
});
function connValidator(dir1, dir2) {
    return (dir1 == "input" && dir2 == "output") || (dir1 == "output" && dir2 == "input") || (dir1 == "omni") || (dir2 == "omni");
}
scene.addLoadClass("widget", BasicWire);
scene.addLoadClass("widget", ConnConsole);
scene.addLoadClass("widget", ConnWidget);
scene.addLoadClass("widget", GridWidget);
//# sourceMappingURL=test.js.map