import { Grid, Pos } from "./module/pos.js";
import { Scene } from "./module/scene.js";
import { AddonTest } from "./module/addons/addons.js";
import { DraggableWidget } from "./module/widgets/draggable-widget.js";
import { GridWidget } from "./module/widgets/grid.js";
import { ConnectorAddon } from "./module/addons/connector.js";
import { AttachableListener } from "./module/attachableListener.js";
import { Listener } from "./module/listener.js";
import { BasicWire } from "./module/widgets/wire.js";

ConnectorAddon.createStyle("test", "input", { background: "white" });
ConnectorAddon.createStyle("test", "output", { background: "black" });
ConnectorAddon.createStyle("test", "omni", { background: "radial-gradient(black, black 50%, white 50%, white)" });

const $ = document.querySelector.bind(document);

const sceneHolder = document.createElement("div");
const scene2Holder = document.createElement("div");

const widget1 = new DraggableWidget({
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
  },
  addons: {
    "main": {
      "side": "bottom",
      "addon": new ConnectorAddon<"input" | "output" | "omni">({
        type: "test",
        direction: "omni",
        validator: connValidator
      })
    }
  }
});

const widget2 = new DraggableWidget({
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
  },
  addons: {
    secondary: {
      "side": "bottom",
      "addon": new ConnectorAddon<"input" | "output" | "omni">({
        type: "test",
        direction: "output",
        positioning: 0.3,
        validator: connValidator
      })
    },
    main: {
      "side": "bottom",
      "addon": new ConnectorAddon<"input" | "output" | "omni">({
        type: "test",
        direction: "omni",
        validator: connValidator
      })
    },
    tertiary: {
      "side": "bottom",
      "addon": new ConnectorAddon<"input" | "output" | "omni">({
        type: "test",
        direction: "input",
        positioning: 0.7,
        validator: connValidator
      })
    }
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
    widget2,
    widget1
  ]
});

setInterval(() => {
  (widget2.addons.get("main") as ConnectorAddon<"output" | "input" | "omni">).sender.trigger("send", "clock pulse");
}, 100);
(widget1.addons.get("main") as ConnectorAddon<"output" | "input" | "omni">).sender.on("receive", (data) => { console.log(data) });
(widget1.addons.get("main") as ConnectorAddon<"output" | "input" | "omni">).sender.on("disconnect", (data) => { console.log(data, "disconencted") })

function connValidator(dir1: "input" | "output" | "omni", dir2: "input" | "output" | "omni") {
  return (dir1 == "input" && dir2 == "output") || (dir1 == "output" && dir2 == "input") || (dir1 == "omni") || (dir2 == "omni")
}


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
