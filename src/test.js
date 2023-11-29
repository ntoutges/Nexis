import { GridWidget } from "./module/widgets/grid.js";
import { Scene } from "./module/scene.js";
import { DraggableWidget } from "./module/widgets/draggable-widget.js";
const $ = document.querySelector.bind(document);
const sceneHolder = document.createElement("div");
const scene2Holder = document.createElement("div");
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
            positioning: 1,
            pos: {
                yAlign: "top",
                xAlign: "left",
                y: 0,
                x: 0
            },
            resize: "both"
        }),
        // new DraggableWidget({
        //   content: document.createElement("div"),
        //   name: "Top",
        //   header: {
        //     title: "Top",
        //   },
        //   style: {
        //     width: "200px"
        //   },
        //   positioning: 1
        // }),
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
            content: scene2Holder,
            name: "Top b",
            header: {
                title: "Top",
            },
            style: {
                width: "200px",
                height: "200px"
            },
            positioning: 1,
            pos: {
                xAlign: "middle",
                yAlign: "middle"
            }
        })
    ],
    doStartCentered: true
});
// scene2Holder.style.width = "100%";
// scene2Holder.style.height = "100%";
// new Scene({
//   parent: scene2Holder,
//   widgets: [
//     new GridWidget({
//       doCursorDragIcon: true,
//       doIndependentCenter: false,
//       style: {
//       }
//     }),
//     new DraggableWidget({
//       content: document.createElement("div"),
//       name: "Top b",
//       header: {
//         title: "Top",
//       },
//       style: {
//         width: "200px"
//       },
//       positioning: 1
//     })
//   ],
//   doStartCentered: true
// })
//# sourceMappingURL=test.js.map