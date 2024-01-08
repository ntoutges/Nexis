import { Grid, Pos } from "./module/pos.js";
import { Scene } from "./module/scene.js";
import { AddonTest } from "./module/widgets/addons.js";
import { DraggableWidget } from "./module/widgets/draggable-widget.js";
import { GridWidget } from "./module/widgets/grid.js";

const $ = document.querySelector.bind(document);

const sceneHolder = document.createElement("div");
const scene2Holder = document.createElement("div");

const widget = new DraggableWidget({
  name: "test",
  content: document.createElement("div"),
  style: {
    width: "200px",
    height: "100px"
  },
  options: {
    // hideOnInactivity: true
  },
  doDragAll: true,
  header: {
    // show: false
  }
});

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
    widget
  ]
});

widget.addons.leftEdge.add(new AddonTest("orange", 16, 0.77));
widget.addons.leftEdge.add(new AddonTest("darkred", 50, 0.9));

widget.addons.leftEdge.add(new AddonTest("black", 30));
widget.addons.leftEdge.add(new AddonTest("red", 40));
widget.addons.leftEdge.add(new AddonTest("green", 50, 0.2));
widget.addons.leftEdge.add(new AddonTest("lightgreen", 50, 0.5));

// scene.addGlobalSnapObject(
//   new Grid<"x"|"y">(
//     new Pos<"x"|"y">({
//       x: {val: 50},
//       y: {val: 50}
//     }),
//     new Pos<"x"|"y">({})
//   )
// )


// sceneHolder.style.width = "100%";
// sceneHolder.style.height = "100%";

// new Scene({
//   parent: sceneHolder,
//   widgets: [
//     new GridWidget({
//       doCursorDragIcon: true,
//       doIndependentCenter: false,
//       style: {

//       }
//     }),
//     new DraggableWidget({
//       content: scene2Holder,
//       name: "Top b",
//       header: {
//         title: "Top",
//       },
//       style: {
//         width: "200px",
//         height: "200px"
//       },
//       positioning: 1,
//       pos: {
//         xAlign: "middle",
//         yAlign: "middle"
//       }
//     })
//   ],
//   doStartCentered: true
// })

// // scene2Holder.style.width = "100%";
// // scene2Holder.style.height = "100%";

// // new Scene({
// //   parent: scene2Holder,
// //   widgets: [
// //     new GridWidget({
// //       doCursorDragIcon: true,
// //       doIndependentCenter: false,
// //       style: {
// //       }
// //     }),
// //     new DraggableWidget({
// //       content: document.createElement("div"),
// //       name: "Top b",
// //       header: {
// //         title: "Top",
// //       },
// //       style: {
// //         width: "200px"
// //       },
// //       positioning: 1
// //     })
// //   ],
// //   doStartCentered: true
// // })
