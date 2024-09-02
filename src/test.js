import { Scene } from "./module/scene.js";
import { DraggableWidget } from "./module/widgets/draggable-widget.js";
import { GridWidget } from "./module/widgets/grid.js";
import { ConnectorAddon } from "./module/addons/connector.js";
import { PeerConnection } from "./connection/module/distros/peer.js";
import { ConnConsole, ConnWidget } from "./module/widgets/prefabs/connWidget.js";
import { WireLine } from "./module/widgets/wire/line.js";
import { WireCatenary } from "./module/widgets/wire/catenary.js";
import { LocalConnection } from "./connection/module/distros/local.js";
import { WireSnake } from "./module/widgets/wire/snake.js";
import { WireWorldWidget } from "./module/widgets/prefabs/wireWorld.js";
import { ConnectorSnapAddon, GridSnapAddon } from "./module/addons/snap.js";
import { LimitAddon } from "./module/addons/limit.js";
ConnectorAddon.setStyle("data", "input", { background: "white" });
ConnectorAddon.setStyle("data", "output", { background: "black" });
ConnectorAddon.setStyle("data", "omni", { background: "radial-gradient(black, black 50%, white 50%, white)" });
ConnectorSnapAddon.setStyle("position", "ball", { borderColor: "#494949", background: "white" });
ConnectorSnapAddon.setStyle("position", "socket", { borderColor: "white", background: "#494949" });
const $ = document.querySelector.bind(document);
// let socket: any;
// try {
//   socket = io();
// } catch(err) {
//   console.log("'io' is not defined; Try running server/server.js");
// }
const peerConn = new PeerConnection({
    Peer,
    prefix: "nexis"
});
// const socketConn = new SocketConnection({
//   socket
// });
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
        // scrollY: false,
        zoom: {
            max: 1e2,
            min: 1e-2,
            able: false
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
            // doCursorDragIcon: true
        }),
        new DraggableWidget({
            name: "test-widget",
            content: document.createElement("div"),
            header: {
                // show: false
                title: "Test of this..."
            },
            doDragAll: true,
            doCursorDragIcon: true,
            addons: {
                "tester": {
                    side: "left",
                    addon: new ConnectorSnapAddon({
                        type: "position",
                        direction: "ball",
                        active: {
                        // normal: false
                        },
                        validator(addon1, addon2) {
                            return addon1.direction != addon2.direction;
                        }
                    })
                }
            },
            style: {
                width: "200px",
                height: "200px",
                background: "#c9ffd9"
            },
            pos: {
                x: 100,
                y: 100
            },
            resize: "both"
        }),
        new DraggableWidget({
            name: "test-widget",
            content: document.createElement("div"),
            header: {
                // show: false
                title: "Test of this..."
            },
            doDragAll: true,
            doCursorDragIcon: true,
            addons: {
                "tester": {
                    side: "left",
                    addon: new ConnectorSnapAddon({
                        type: "position",
                        direction: "ball",
                        active: {
                        // normal: false
                        },
                        config: {
                            onlyOne: true
                        },
                        validator(addon1, addon2) {
                            return addon1.direction != addon2.direction;
                        }
                    })
                },
                "tester2": {
                    side: "right",
                    addon: new ConnectorSnapAddon({
                        type: "position",
                        direction: "socket",
                        active: {
                        // normal: false
                        },
                        config: {
                            host: true,
                            onlyOne: true
                        },
                        validator(addon1, addon2) {
                            return addon1.direction != addon2.direction;
                        }
                    })
                },
                // "grid": {
                //   side: "left",
                //   addon: new GridSnapAddon({
                //     positioning: 0.5,
                //     grid: {
                //       size: 50
                //     }
                //   })
                // },
            },
            style: {
                width: "200px",
                height: "200px",
                background: "c9ffd9"
            },
            pos: {
                x: 100,
                y: 100
            },
            resize: "both"
        }),
        new DraggableWidget({
            name: "test-widget",
            content: document.createElement("div"),
            header: {
                // show: false
                title: "Me host!"
            },
            doDragAll: true,
            doCursorDragIcon: true,
            addons: {
                "tester": {
                    side: "right",
                    addon: new ConnectorSnapAddon({
                        type: "position",
                        direction: "socket",
                        active: {
                            minimize: false
                        },
                        config: {
                            host: true,
                            onlyOne: true
                        },
                        validator(addon1, addon2) {
                            return addon1.direction != addon2.direction;
                        }
                    })
                },
                "grid": {
                    side: "left",
                    addon: new GridSnapAddon({
                        positioning: 0.5,
                        grid: {
                            size: 1
                        }
                    })
                },
                "l1": {
                    side: "left",
                    addon: new LimitAddon({
                        limit: {
                        // y: [-250, 250],
                        },
                        positioning: 0.5,
                    })
                },
                "l2": {
                    side: "top",
                    addon: new LimitAddon({
                        limit: {
                        // x: [-250, 250]
                        },
                        positioning: 0.5,
                    })
                }
            },
            style: {
                width: "200px",
                height: "200px",
                background: "#c9ffd9"
            },
            resize: "both"
        }),
        // new DraggableWidget({
        //     content: document.createElement("div"),
        //     name: "tester",
        //     header: {
        //         title: "Addon Tester"
        //     },
        //     resize: "both",
        //     // pos: {
        //     //     x: -200,
        //     //     y: -200
        //     // },
        //     style: {
        //         width: "200px",
        //         height: "200px",
        //         background: "skyblue"
        //     },
        //     doDragAll: true,
        //     addons: {
        //         "A": {
        //             side: "left",
        //             layer: 0,
        //             addon: new ConnectorAddon<string>({
        //                 direction: "output",
        //                 type: "data",
        //                 positioning: 0.51,
        //                 wireData: {
        //                     type: WireSnake,
        //                     params: {}
        //                 }
        //             })
        //         },
        //         "B": {
        //             side: "left",
        //             layer: 1,
        //             addon: new ConnectorAddon<string>({
        //                 direction: "input",
        //                 type: "data",
        //                 positioning: 0.49,
        //                 wireData: {
        //                     type: WireSnake,
        //                     params: {}
        //                 }
        //             })
        //         }
        //     }
        // })
    ]
});
function connValidator(dir1, dir2) {
    return (dir1 == "input" && dir2 == "output") || (dir1 == "output" && dir2 == "input") || (dir1 == "omni") || (dir2 == "omni");
}
scene.objectRepository.addObject("addon", ConnectorAddon);
scene.objectRepository.addObject("addon", GridSnapAddon);
scene.objectRepository.addObject("addon", ConnectorSnapAddon);
scene.objectRepository.addObject("addon", LimitAddon);
scene.objectRepository.addObject("widget", DraggableWidget);
scene.objectRepository.addObject("widget", ConnConsole);
scene.objectRepository.addObject("widget", GridWidget);
scene.objectRepository.addObject("widget", ConnWidget);
scene.objectRepository.addObject("widget", WireWorldWidget);
scene.objectRepository.addObject("widget", WireLine);
scene.objectRepository.addObject("widget", WireCatenary);
scene.objectRepository.addObject("widget", WireSnake);
scene.objectRepository.addObject("+conn", LocalConnection);
scene.objectRepository.addObject("+conn", PeerConnection, { Peer });
// scene.objectRepository.addObject("+conn", SocketConnection, { socket });
// const load = localStorage.getItem("save");
try {
    // if (load) scene.load(JSON.parse(load));
}
catch (err) {
    localStorage.removeItem("save");
}
fetch("./load.json").then(state => state.json()).then(state => {
    // scene.load(state);
});
// setInterval(() => {
// localStorage.setItem("save", JSON.stringify(scene.save()));
//   console.log(JSON.stringify(scene.save()));
// }, 1000);
//# sourceMappingURL=test.js.map