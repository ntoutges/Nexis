import { Scene } from "./module/scene.js";
import { Addon } from "./module/addons/base.js";
import { DraggableWidget } from "./module/widgets/draggable-widget.js";
import { GridWidget } from "./module/widgets/grid.js";
import { ConnectorAddon } from "./module/addons/connector.js";
import { ConnConsole, ConnWidget } from "./module/widgets/prefabs/connWidget.js";
import { WireLine } from "./module/widgets/wire/line.js";
import { AddonEdgeAlias } from "./module/addons/alias.js";
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
        new DraggableWidget({
            name: "addonTest",
            header: {
                title: "Addon Test"
            },
            style: {
                width: "200px",
                height: "50px"
            },
            addons: {
                "l1": {
                    side: "bottom",
                    addon: new Addon({
                        content: document.createElement("div")
                    })
                },
                "l2": {
                    side: "bottom",
                    addon: new Addon({
                        content: document.createElement("div")
                    })
                },
                "l3": {
                    side: "bottom",
                    addon: new Addon({
                        content: document.createElement("div")
                    })
                },
                "l4": {
                    side: "bottom",
                    addon: new Addon({
                        content: document.createElement("div")
                    })
                },
                // "alias": {
                //   side: "right",
                //   addon: new AddonEdgeAlias({
                //     addons: [
                //       new Addon({
                //         content: document.createElement("div")
                //       }),
                //       new Addon({
                //         content: document.createElement("div")
                //       }),
                //       new Addon({
                //         content: document.createElement("div")
                //       }),
                //       new Addon({
                //         content: document.createElement("div")
                //       }),
                //       new Addon({
                //         content: document.createElement("div")
                //       }),
                //       new Addon({
                //         content: document.createElement("div")
                //       }),
                //       new Addon({
                //         content: document.createElement("div")
                //       }),
                //       new Addon({
                //         content: document.createElement("div")
                //       })
                //     ],
                //     style: {
                //       gap: "5px"
                //     }
                //   })
                // },
                // "alias2": {
                //   side: "top",
                //   addon: new AddonEdgeAlias({
                //     addons: [
                //       new Addon({
                //         content: document.createElement("div")
                //       }),
                //       new Addon({
                //         content: document.createElement("div")
                //       }),
                //       new Addon({
                //         content: document.createElement("div")
                //       }),
                //       new Addon({
                //         content: document.createElement("div")
                //       }),
                //       new Addon({
                //         content: document.createElement("div")
                //       }),
                //       new Addon({
                //         content: document.createElement("div")
                //       }),
                //       new Addon({
                //         content: document.createElement("div")
                //       }),
                //       new Addon({
                //         content: document.createElement("div")
                //       })
                //     ],
                //     style: {
                //       gap: "5px"
                //     }
                //   })
                // },
                "alias3": {
                    side: "bottom",
                    addon: new AddonEdgeAlias({
                        addons: [
                            new Addon({
                                content: document.createElement("div")
                            }),
                            new Addon({
                                content: document.createElement("div")
                            }),
                            new Addon({
                                content: document.createElement("div")
                            }),
                            new Addon({
                                content: document.createElement("div")
                            }),
                            new Addon({
                                content: document.createElement("div")
                            }),
                            new Addon({
                                content: document.createElement("div")
                            }),
                            new Addon({
                                content: document.createElement("div")
                            }),
                            new Addon({
                                content: document.createElement("div")
                            })
                        ],
                        style: {
                            gap: "5px"
                        },
                        weight: 100
                    })
                }
            },
            resize: "both"
        })
    ]
});
function connValidator(dir1, dir2) {
    return (dir1 == "input" && dir2 == "output") || (dir1 == "output" && dir2 == "input") || (dir1 == "omni") || (dir2 == "omni");
}
scene.addLoadClass("widget", WireLine);
scene.addLoadClass("widget", ConnConsole);
scene.addLoadClass("widget", ConnWidget);
scene.addLoadClass("widget", GridWidget);
//# sourceMappingURL=test.js.map