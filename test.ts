import { Grid, Pos } from "./module/pos.js";
import { Scene } from "./module/scene.js";
import { AddonTest } from "./module/addons/addons.js";
import { DraggableWidget } from "./module/widgets/draggable-widget.js";
import { GridWidget } from "./module/widgets/grid.js";
import { ConnectorAddon } from "./module/addons/connector.js";
import { AttachableListener } from "./module/attachableListener.js";
import { Listener } from "./module/listener.js";
import { BasicWire } from "./module/widgets/wire.js";
import { PeerConnection } from "./connection/lib/distros/peer.js";
import { FAnimation } from "./module/animation.js";
import { ConnConsole, ConnWidget } from "./module/widgets/prefabs/connWidget.js";

ConnectorAddon.setStyle("data", "input", { background: "white" });
ConnectorAddon.setStyle("data", "output", { background: "black" });
ConnectorAddon.setStyle("data", "omni", { background: "radial-gradient(black, black 50%, white 50%, white)" });

const $ = document.querySelector.bind(document);

declare const Peer: any;

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
    // new GridWidget({
    //   style: {
    //     background: "cornsilk"
    //   },
    //   options: {
    //     coords: true
    //   },
    //   doCursorDragIcon: true
    // }),
    // new ConnWidget({
    //   wireType: "data",
    //   connections: { "peer": new PeerConnection(Peer, "fw") }
    // }),
    // new ConnWidget({
    //   wireType: "data",
    //   connections: { "peer": new PeerConnection(Peer, "fw") }
    // }),
    // new ConnConsole({
    //   wireType: "data"
    // }),
    // new ConnConsole({
    //   wireType: "data"
    // })
  ]
});

function connValidator(dir1: "input" | "output" | "omni", dir2: "input" | "output" | "omni") {
  return (dir1 == "input" && dir2 == "output") || (dir1 == "output" && dir2 == "input") || (dir1 == "omni") || (dir2 == "omni")
}

scene.addLoadClass("widget", BasicWire)
scene.addLoadClass("widget", ConnConsole);
scene.addLoadClass("widget", ConnWidget);
scene.addLoadClass("widget", GridWidget);

scene.load(JSON.parse(`{"widgets":{"0":{"params":{"style":{"background":"cornsilk"},"resize":"none","positioning":0,"doZoomScale":true,"layer":-1,"pos":{},"options":{"coords":true},"doCursorDragIcon":true,"doIndependentCenter":false,"gridChangeScaleFactor":0.4},"id":0,"type":"GridWidget","pos":{"x":0,"y":0},"addons":{"left":{},"right":{},"top":{},"bottom":{}}},"2":{"params":{"wireType":"data"},"id":2,"type":"ConnWidget","pos":{"x":0,"y":0},"addons":{"left":{"1":{"type":"ConnectorAddon","id":1,"edge":"left","widget":2}},"right":{"1":{"type":"ConnectorAddon","id":1,"edge":"right","widget":2},"2":{"type":"ConnectorAddon","id":2,"edge":"right","widget":2}},"top":{},"bottom":{}}},"5":{"params":{"wireType":"data"},"id":5,"type":"ConnWidget","pos":{"x":0,"y":0},"addons":{"left":{"1":{"type":"ConnectorAddon","id":1,"edge":"left","widget":5}},"right":{"1":{"type":"ConnectorAddon","id":1,"edge":"right","widget":5},"2":{"type":"ConnectorAddon","id":2,"edge":"right","widget":5}},"top":{},"bottom":{}}},"8":{"params":{"wireType":"data"},"id":8,"type":"ConnConsole","pos":{"x":-187,"y":-301},"addons":{"left":{"1":{"type":"ConnectorAddon","id":1,"edge":"left","widget":8}},"right":{"1":{"type":"ConnectorAddon","id":1,"edge":"right","widget":8}},"top":{},"bottom":{}}},"12":{"params":{"wireType":"data"},"id":12,"type":"ConnConsole","pos":{"x":205,"y":-239},"addons":{"left":{"1":{"type":"ConnectorAddon","id":1,"edge":"left","widget":12}},"right":{"1":{"type":"ConnectorAddon","id":1,"edge":"right","widget":12}},"top":{},"bottom":{}}},"16":{"params":{},"id":16,"type":"BasicWire","pos":{"x":13,"y":-177},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"type":"ConnectorAddon","id":1,"edge":"right","widget":8},"hasAddon":true},"point2":{"addon":{"type":"ConnectorAddon","id":1,"edge":"left","widget":12},"hasAddon":true}}}},"nested":[]}`))

// setInterval(() => {
//   console.log(JSON.stringify(scene.save()))
// }, 1000)