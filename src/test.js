import { GridWidget } from "./module/widgets/grid.js";
import { Scene } from "./module/scene.js";
import { BlockWidget } from "./module/widgets/block.js";
import { DraggableWidget } from "./module/widgets/draggable-widget.js";
const $ = document.querySelector.bind(document);
const scene = new Scene({
    parent: $("#sandbox"),
    style: {
        width: "100vw",
        height: "100vh",
        background: "white"
    },
    doStartCentered: true,
    options: {
    // scrollX: false,
    // scrollY: false
    },
    widgets: [
        new GridWidget({
            options: {
                coords: true
            },
            style: {
                background: "cornsilk"
            },
            doCursorDragIcon: true,
            layer: -1
        }),
        new BlockWidget({
            positioning: 1,
            pos: {
                x: 0,
                y: 0,
                xAlign: "middle",
                yAlign: "middle"
            },
            style: {
                background: "grey"
            }
        }),
        new BlockWidget({
            positioning: 1,
            pos: {
                x: 0,
                y: 0,
                xAlign: "middle",
                yAlign: "middle"
            },
            style: {
                border: "black solid",
                background: "transparent",
                width: "55px",
                height: "55px"
            }
        }),
        new DraggableWidget({
            content: document.createElement("div"),
            name: "Bottom1",
            header: {
                title: "Bottom1",
            },
            style: {
                width: "150px"
            }
        }),
        new DraggableWidget({
            content: document.createElement("div"),
            name: "Bottom2",
            header: {
                title: "Bottom2",
            },
            style: {
                width: "150px"
            }
        }),
        new DraggableWidget({
            content: document.createElement("div"),
            name: "Top",
            header: {
                title: "Top",
            },
            style: {
                width: "200px"
            },
            positioning: 1 // TODO: make this NOT affect dragging
        }),
    ],
});
//# sourceMappingURL=test.js.map