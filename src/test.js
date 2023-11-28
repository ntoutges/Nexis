import { GridWidget } from "./module/widgets/grid.js";
import { Scene } from "./module/scene.js";
import { DraggableWidget } from "./module/widgets/draggable-widget.js";
const $ = document.querySelector.bind(document);
const sceneHolder = document.createElement("div");
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
        // new DraggableWidget({
        //   content: document.createElement("div"),
        //   name: "Bottom1",
        //   header: {
        //     title: "Bottom1",
        //   },
        //   style: {
        //     width: "150px",
        //     height: "50%"
        //   }
        // }),
        new DraggableWidget({
            content: sceneHolder,
            name: "Bottom2",
            header: {
                title: "Bottom2",
            },
            style: {
                width: "50%",
                height: "50%"
            },
            positioning: 1
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
            positioning: 1
        }),
    ],
});
sceneHolder.style.width = "100%";
sceneHolder.style.height = "100%";
new Scene({
    parent: sceneHolder,
    widgets: [
        new GridWidget({
            doCursorDragIcon: true,
            doIndependentCenter: false,
            style: {}
        }),
        new DraggableWidget({
            content: document.createElement("div"),
            name: "Top b",
            header: {
                title: "Top",
            },
            style: {
                width: "200px"
            },
            positioning: 1
        })
    ],
    doStartCentered: true
});
//# sourceMappingURL=test.js.map