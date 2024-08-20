import { Grid, Pos } from "./module/pos.js";
import { Scene } from "./module/scene.js";
import { Addon, AddonTest } from "./module/addons/base.js";
import { DraggableWidget } from "./module/widgets/draggable-widget.js";
import { GridWidget } from "./module/widgets/grid.js";
import { ConnectorAddon } from "./module/addons/connector.js";
import { AttachableListener } from "./module/attachableListener.js";
import { Listener } from "./module/listener.js";
import { PeerConnection } from "./connection/module/distros/peer.js";
import { FAnimation } from "./module/animation.js";
import { ConnConsole, ConnWidget } from "./module/widgets/prefabs/connWidget.js";
import { WireLine } from "./module/widgets/wire/line.js";
import { WireCatenary } from "./module/widgets/wire/catenary.js";
import { AddonEdgeAlias } from "./module/addons/alias.js";
import { LocalConnection } from "./connection/module/distros/local.js";
import { SocketConnection } from "./connection/module/distros/socket.js";
import { WireSnake } from "./module/widgets/wire/snake.js";
import { WireWorldWidget } from "./module/widgets/prefabs/wireWorld.js";

ConnectorAddon.setStyle("data", "input", { background: "white" });
ConnectorAddon.setStyle("data", "output", { background: "black" });
ConnectorAddon.setStyle("data", "omni", { background: "radial-gradient(black, black 50%, white 50%, white)" });

const $ = document.querySelector.bind(document);

declare const Peer: any;
declare const io: any;

// let socket: any;

// try {
//   socket = io();
// } catch(err) {
//   console.log("'io' is not defined; Try running server/server.js");
// }

const peerConn = new PeerConnection({
  Peer,
  prefix: "framework"
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
    // new WireWorldWidget({
    //   type: "data",
    //   validator: connValidator,
    //   wireData: {
    //     type: WireLine,
    //     params: {}
    //   }
    // }),
    // new WireWorldWidget({
    //   type: "data",
    //   validator: connValidator,
    //   wireData: {
    //     type: WireLine,
    //     params: {}
    //   }
    // }),
    // new WireWorldWidget({
    //   type: "data",
    //   validator: connValidator,
    //   wireData: {
    //     type: WireCatenary,
    //     params: {}
    //   }
    // }),
    // new WireWorldWidget({
    //   type: "data",
    //   validator: connValidator,
    //   wireData: {
    //     type: WireSnake,
    //     params: {}
    //   },
    //   color: "orange"
    // })
  ]
});

function connValidator(dir1: "input" | "output" | "omni", dir2: "input" | "output" | "omni") {
  return (dir1 == "input" && dir2 == "output") || (dir1 == "output" && dir2 == "input") || (dir1 == "omni") || (dir2 == "omni")
}

scene.objectRepository.addObject("addon", ConnectorAddon);

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

const load = localStorage.getItem("save");
try {
  // if (load) scene.load(JSON.parse(load));
} catch(err) { localStorage.removeItem("save"); }

scene.load({"widgets":{"0":{"$$I":{"name":"WireWorldWidget","type":"widget","group":1,"data":{"params":{"name":"wire-world","resize":"none","positioning":1,"doZoomScale":true,"layer":0,"pos":{},"header":{"show":false},"doCursorDragIcon":true,"doDragAll":true,"type":"data","validator":{"$$F":{"data":"function connValidator(dir1, dir2) {\n    return (dir1 == \"input\" && dir2 == \"output\") || (dir1 == \"output\" && dir2 == \"input\") || (dir1 == \"omni\") || (dir2 == \"omni\");\n}"}},"wireData":{"type":{"$$C":{"name":"WireCatenary","type":"widget"}},"params":{}},"color":"white"},"id":0,"type":"WireWorldWidget","pos":{"x":-149.24307932732557,"y":101.48529394258128},"addons":{"left":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":1,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"left","widget":0}}}},"right":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":2,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"right","widget":0}}}},"top":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":3,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"top","widget":0}}}},"bottom":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":4,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"bottom","widget":0}}}}}}}},"3":{"$$I":{"name":"GridWidget","type":"widget","group":1,"data":{"params":{"style":{"background":"cornsilk"},"resize":"none","positioning":0,"doZoomScale":true,"layer":-1,"pos":{},"options":{"coords":true},"doCursorDragIcon":true,"doIndependentCenter":false,"gridChangeScaleFactor":0.4},"id":3,"type":"GridWidget","pos":{"x":0,"y":0},"addons":{"left":{},"right":{},"top":{},"bottom":{}}}}},"5":{"$$I":{"name":"WireWorldWidget","type":"widget","group":2,"data":{"params":{"name":"wire-world","resize":"none","positioning":1,"doZoomScale":true,"layer":0,"pos":{},"header":{"show":false},"doCursorDragIcon":true,"doDragAll":true,"type":"data","validator":{"$$F":{"data":"function connValidator(dir1, dir2) {\n    return (dir1 == \"input\" && dir2 == \"output\") || (dir1 == \"output\" && dir2 == \"input\") || (dir1 == \"omni\") || (dir2 == \"omni\");\n}"}},"wireData":{"type":{"$$C":{"name":"WireLine","type":"widget"}},"params":{}},"color":"white"},"id":5,"type":"WireWorldWidget","pos":{"x":-149.24307932732526,"y":-150.73551012059892},"addons":{"left":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":5,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"left","widget":5}}}},"right":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":6,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"right","widget":5}}}},"top":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":7,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"top","widget":5}}}},"bottom":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":8,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"bottom","widget":5}}}}}}}},"8":{"$$I":{"name":"WireWorldWidget","type":"widget","group":3,"data":{"params":{"name":"wire-world","resize":"none","positioning":1,"doZoomScale":true,"layer":0,"pos":{},"header":{"show":false},"doCursorDragIcon":true,"doDragAll":true,"type":"data","validator":{"$$F":{"data":"function connValidator(dir1, dir2) {\n    return (dir1 == \"input\" && dir2 == \"output\") || (dir1 == \"output\" && dir2 == \"input\") || (dir1 == \"omni\") || (dir2 == \"omni\");\n}"}},"wireData":{"type":{"$$C":{"name":"WireLine","type":"widget"}},"params":{}},"color":"white"},"id":8,"type":"WireWorldWidget","pos":{"x":100.73907854594471,"y":-149.989294723962},"addons":{"left":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":9,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"left","widget":8}}}},"right":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":10,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"right","widget":8}}}},"top":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":11,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"top","widget":8}}}},"bottom":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":12,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"bottom","widget":8}}}}}}}},"11":{"$$I":{"name":"WireWorldWidget","type":"widget","group":4,"data":{"params":{"name":"wire-world","resize":"none","positioning":1,"doZoomScale":true,"layer":0,"pos":{},"header":{"show":false},"doCursorDragIcon":true,"doDragAll":true,"type":"data","validator":{"$$F":{"data":"function connValidator(dir1, dir2) {\n    return (dir1 == \"input\" && dir2 == \"output\") || (dir1 == \"output\" && dir2 == \"input\") || (dir1 == \"omni\") || (dir2 == \"omni\");\n}"}},"wireData":{"type":{"$$C":{"name":"WireCatenary","type":"widget"}},"params":{}},"color":"white"},"id":11,"type":"WireWorldWidget","pos":{"x":100.95728847291576,"y":100.06498679122959},"addons":{"left":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":13,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"left","widget":11}}}},"right":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":14,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"right","widget":11}}}},"top":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":15,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"top","widget":11}}}},"bottom":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":16,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"bottom","widget":11}}}}}}}},"14":{"$$I":{"name":"WireWorldWidget","type":"widget","group":5,"data":{"params":{"name":"wire-world","resize":"none","positioning":1,"doZoomScale":true,"layer":0,"pos":{},"header":{"show":false},"doCursorDragIcon":true,"doDragAll":true,"type":"data","validator":{"$$F":{"data":"function connValidator(dir1, dir2) {\n    return (dir1 == \"input\" && dir2 == \"output\") || (dir1 == \"output\" && dir2 == \"input\") || (dir1 == \"omni\") || (dir2 == \"omni\");\n}"}},"wireData":{"type":{"$$C":{"name":"WireSnake","type":"widget"}},"params":{}},"color":"orange"},"id":14,"type":"WireWorldWidget","pos":{"x":-23.921604219456224,"y":-25.72664384576759},"addons":{"left":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":17,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"left","widget":14}}}},"right":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":18,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"right","widget":14}}}},"top":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":19,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"top","widget":14}}}},"bottom":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":20,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"bottom","widget":14}}}}}}}},"30":{"$$I":{"name":"WireSnake","type":"widget","group":1,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true},"id":30,"type":"WireSnake","pos":{"x":-0.9331992261844562,"y":-126.99986792206073},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"top","widget":14},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"left","widget":8},"hasAddon":true}}}}},"32":{"$$I":{"name":"WireSnake","type":"widget","group":2,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true},"id":32,"type":"WireSnake","pos":{"x":-96.25074377562197,"y":-127.74608331869737},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"top","widget":14},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"right","widget":5},"hasAddon":true}}}}},"34":{"$$I":{"name":"WireSnake","type":"widget","group":3,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true},"id":34,"type":"WireSnake","pos":{"x":-96.25074377562197,"y":27.268307085964523},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"bottom","widget":14},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"right","widget":0},"hasAddon":true}}}}},"36":{"$$I":{"name":"WireSnake","type":"widget","group":4,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true},"id":36,"type":"WireSnake","pos":{"x":-0.9331992261844562,"y":27.268307085964523},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"bottom","widget":14},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"left","widget":11},"hasAddon":true}}}}},"40":{"$$I":{"name":"WireSnake","type":"widget","group":5,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true},"id":40,"type":"WireSnake","pos":{"x":29.066804397040983,"y":-96.99987568517855},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"right","widget":14},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"bottom","widget":8},"hasAddon":true}}}}},"42":{"$$I":{"name":"WireSnake","type":"widget","group":6,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true},"id":42,"type":"WireSnake","pos":{"x":-126.25074739884747,"y":-97.74609108181517},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"left","widget":14},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"bottom","widget":5},"hasAddon":true}}}}},"44":{"$$I":{"name":"WireSnake","type":"widget","group":7,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true},"id":44,"type":"WireSnake","pos":{"x":-126.25074739884747,"y":-2.731685150917656},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"left","widget":14},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"top","widget":0},"hasAddon":true}}}}},"50":{"$$I":{"name":"WireSnake","type":"widget","group":8,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true},"id":50,"type":"WireSnake","pos":{"x":-183.25075102207302,"y":-2.731685150917656},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"left","widget":14},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"left","widget":0},"hasAddon":true}}}}},"52":{"$$I":{"name":"WireSnake","type":"widget","group":9,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true},"id":52,"type":"WireSnake","pos":{"x":-126.25074739884809,"y":27.268307085964523},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"bottom","widget":14},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"bottom","widget":0},"hasAddon":true}}}}},"54":{"$$I":{"name":"WireSnake","type":"widget","group":10,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true},"id":54,"type":"WireSnake","pos":{"x":-0.9331992261844562,"y":27.268307085964523},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"bottom","widget":14},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"bottom","widget":11},"hasAddon":true}}}}},"58":{"$$I":{"name":"WireSnake","type":"widget","group":11,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true},"id":58,"type":"WireSnake","pos":{"x":29.066804397040983,"y":-2.731685150917656},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"right","widget":14},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"top","widget":11},"hasAddon":true}}}}},"60":{"$$I":{"name":"WireSnake","type":"widget","group":12,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true},"id":60,"type":"WireSnake","pos":{"x":29.066804397040983,"y":-2.731685150917656},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"right","widget":14},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"right","widget":11},"hasAddon":true}}}}},"68":{"$$I":{"name":"WireSnake","type":"widget","group":13,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true},"id":68,"type":"WireSnake","pos":{"x":-0.9331992261844562,"y":-183.99987154528657},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"top","widget":14},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"top","widget":8},"hasAddon":true}}}}},"70":{"$$I":{"name":"WireSnake","type":"widget","group":14,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true},"id":70,"type":"WireSnake","pos":{"x":-126.25074739884809,"y":-184.7460869419232},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"top","widget":14},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"top","widget":5},"hasAddon":true}}}}},"74":{"$$I":{"name":"WireSnake","type":"widget","group":15,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true},"id":74,"type":"WireSnake","pos":{"x":-183.25075102207364,"y":-127.74608331869766},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"left","widget":14},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"left","widget":5},"hasAddon":true}}}}},"82":{"$$I":{"name":"WireSnake","type":"widget","group":16,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true},"id":82,"type":"WireSnake","pos":{"x":29.066804397040983,"y":-126.99986792206104},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"right","widget":14},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"right","widget":8},"hasAddon":true}}}}},"96":{"$$I":{"name":"WireSnake","type":"widget","group":17,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true},"id":96,"type":"WireSnake","pos":{"x":29.066804397040983,"y":-126.99986792206104},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"right","widget":14},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"left","widget":8},"hasAddon":true}}}}},"98":{"$$I":{"name":"WireSnake","type":"widget","group":18,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true},"id":98,"type":"WireSnake","pos":{"x":-96.2507437756226,"y":-127.74608331869766},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"left","widget":14},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"right","widget":5},"hasAddon":true}}}}},"100":{"$$I":{"name":"WireSnake","type":"widget","group":19,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true},"id":100,"type":"WireSnake","pos":{"x":-96.2507437756226,"y":-2.731685150917656},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"left","widget":14},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"right","widget":0},"hasAddon":true}}}}},"102":{"$$I":{"name":"WireSnake","type":"widget","group":20,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true},"id":102,"type":"WireSnake","pos":{"x":29.066804397040983,"y":-2.731685150917656},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"right","widget":14},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"left","widget":11},"hasAddon":true}}}}}},"nested":[]})

setInterval(() => {
  // localStorage.setItem("save", JSON.stringify(scene.save()));
  // console.log(JSON.stringify(scene.save()));
}, 1000);
