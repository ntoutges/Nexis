import { GridWidget } from "./module/widgets/grid.js";
import { Scene } from "./module/scene.js";
import { BlockWidget } from "./module/widgets/block.js";

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
      doCursorDrag: true
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
    })
  ]
});
