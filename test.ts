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
import { WireOrth } from "./module/widgets/wire/orth.js";

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
    // new ConnWidget({
    //   type: "data",
    //   connections: {
    //     "peer": peerConn,
    //     "local": new LocalConnection({})
    //   },
    //   validator: connValidator,
    //   wireData: {
    //     params: {},
    //     type: WireCatenary
    //   }
    // }),
    // new ConnWidget({
    //   type: "data",
    //   connections: {
    //     "peer": peerConn,
    //     "local": new LocalConnection({})
    //   },
    //   validator: connValidator,
    //   wireData: {
    //     params: {},
    //     type: WireLine
    //   }
    // }),
    // new ConnWidget({
    //   type: "data",
    //   connections: {
    //     "peer": peerConn,
    //     "local": new LocalConnection({})
    //   },
    //   validator: connValidator,
    //   wireData: {
    //     params: {},
    //     type: WireOrth
    //   }
    // }),
    // new ConnWidget({
    //   type: "data",
    //   connections: {
    //     "peer": peerConn,
    //     "local": new LocalConnection({})
    //   },
    //   validator: connValidator,
    //   wireData: {
    //     params: {},
    //     type: WireCatenary
    //   }
    // }),
    // new ConnConsole({
    //   type: "data",
    //   validator: connValidator,
    //   wireData: {
    //     params: {},
    //     type: WireCatenary
    //   }
    // }),
    // new ConnConsole({
    //   type: "data",
    //   validator: connValidator,
    //   wireData: {
    //     params: {},
    //     type: WireLine
    //   }
    // }),
    // new ConnConsole({
    //   type: "data",
    //   validator: connValidator,
    //   wireData: {
    //     params: {},
    //     type: WireCatenary
    //   }
    // }),
    // new ConnConsole({
    //   type: "data",
    //   validator: connValidator,
    //   wireData: {
    //     params: {},
    //     type: WireCatenary
    //   }
    // }),
    // new ConnConsole({
    //   type: "data",
    //   validator: connValidator,
    //   wireData: {
    //     params: {},
    //     type: WireCatenary
    //   }
    // }),
    // new ConnConsole({
    //   type: "data",
    //   validator: connValidator,
    //   wireData: {
    //     params: {},
    //     type: WireCatenary
    //   }
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

scene.objectRepository.addObject("widget", WireLine);
scene.objectRepository.addObject("widget", WireCatenary);
scene.objectRepository.addObject("widget", WireOrth);

scene.objectRepository.addObject("+conn", LocalConnection);
scene.objectRepository.addObject("+conn", PeerConnection, { Peer });
// scene.objectRepository.addObject("+conn", SocketConnection, { socket });

const load = localStorage.getItem("save");
try {
  // if (load) scene.load(JSON.parse(load));
} catch(err) { localStorage.removeItem("save"); }

scene.load({"widgets":{"0":{"$$I":{"name":"GridWidget","type":"widget","group":1,"data":{"params":{"style":{"background":"cornsilk"},"resize":"none","positioning":0,"doZoomScale":true,"layer":-1,"pos":{},"options":{"coords":true},"doCursorDragIcon":true,"doIndependentCenter":false,"gridChangeScaleFactor":0.4},"id":0,"type":"GridWidget","pos":{"x":0,"y":0},"addons":{"left":{},"right":{},"top":{},"bottom":{}}}}},"2":{"$$I":{"name":"ConnWidget","type":"widget","group":1,"data":{"params":{"type":"data","connections":{"peer":{"$$I":{"name":"PeerConnection","type":"+conn","group":1,"data":{"params":{"prefix":"framework"}}}},"local":{"$$I":{"name":"LocalConnection","type":"+conn","group":1,"data":{"params":{"worldId":"default"}}}}},"validator":{"$$F":{"data":"function connValidator(dir1, dir2) {\n    return (dir1 == \"input\" && dir2 == \"output\") || (dir1 == \"output\" && dir2 == \"input\") || (dir1 == \"omni\") || (dir2 == \"omni\");\n}"}},"wireData":{"params":{},"type":{"$$C":{"name":"WireCatenary","type":"widget"}}}},"id":2,"type":"ConnWidget","pos":{"x":101,"y":-24},"addons":{"left":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":1,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"left","widget":2}}},"2":{"$$I":{"name":"ConnectorAddon","type":"addon","group":2,"data":{"params":{"positioning":0.9,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":2,"edge":"left","widget":2}}}},"right":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":3,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"right","widget":2}}},"2":{"$$I":{"name":"ConnectorAddon","type":"addon","group":4,"data":{"params":{"positioning":0.9,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":2,"edge":"right","widget":2}}}},"top":{},"bottom":{}},"d":{"connType":"peer","routerId":"","connId":"","channel":"default"}}}},"5":{"$$I":{"name":"ConnWidget","type":"widget","group":2,"data":{"params":{"type":"data","connections":{"peer":{"$$I":{"name":"PeerConnection","type":"+conn","group":1,"data":{"params":{"prefix":"framework"}}}},"local":{"$$I":{"name":"LocalConnection","type":"+conn","group":2,"data":{"params":{"worldId":"default"}}}}},"validator":{"$$F":{"data":"function connValidator(dir1, dir2) {\n    return (dir1 == \"input\" && dir2 == \"output\") || (dir1 == \"output\" && dir2 == \"input\") || (dir1 == \"omni\") || (dir2 == \"omni\");\n}"}},"wireData":{"params":{},"type":{"$$C":{"name":"WireLine","type":"widget"}}}},"id":5,"type":"ConnWidget","pos":{"x":-297,"y":-22},"addons":{"left":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":5,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"left","widget":5}}},"2":{"$$I":{"name":"ConnectorAddon","type":"addon","group":6,"data":{"params":{"positioning":0.9,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":2,"edge":"left","widget":5}}}},"right":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":7,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"right","widget":5}}},"2":{"$$I":{"name":"ConnectorAddon","type":"addon","group":8,"data":{"params":{"positioning":0.9,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":2,"edge":"right","widget":5}}}},"top":{},"bottom":{}},"d":{"connType":"peer","routerId":"","connId":"","channel":"default"}}}},"8":{"$$I":{"name":"ConnWidget","type":"widget","group":3,"data":{"params":{"type":"data","connections":{"peer":{"$$I":{"name":"PeerConnection","type":"+conn","group":1,"data":{"params":{"prefix":"framework"}}}},"local":{"$$I":{"name":"LocalConnection","type":"+conn","group":3,"data":{"params":{"worldId":"default"}}}}},"validator":{"$$F":{"data":"function connValidator(dir1, dir2) {\n    return (dir1 == \"input\" && dir2 == \"output\") || (dir1 == \"output\" && dir2 == \"input\") || (dir1 == \"omni\") || (dir2 == \"omni\");\n}"}},"wireData":{"params":{},"type":{"$$C":{"name":"WireOrth","type":"widget"}}}},"id":8,"type":"ConnWidget","pos":{"x":3,"y":-255},"addons":{"left":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":9,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"left","widget":8}}},"2":{"$$I":{"name":"ConnectorAddon","type":"addon","group":10,"data":{"params":{"positioning":0.9,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":2,"edge":"left","widget":8}}}},"right":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":11,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"right","widget":8}}},"2":{"$$I":{"name":"ConnectorAddon","type":"addon","group":12,"data":{"params":{"positioning":0.9,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":2,"edge":"right","widget":8}}}},"top":{},"bottom":{}},"d":{"connType":"peer","routerId":"","connId":"","channel":"default"}}}},"11":{"$$I":{"name":"ConnWidget","type":"widget","group":4,"data":{"params":{"type":"data","connections":{"peer":{"$$I":{"name":"PeerConnection","type":"+conn","group":1,"data":{"params":{"prefix":"framework"}}}},"local":{"$$I":{"name":"LocalConnection","type":"+conn","group":4,"data":{"params":{"worldId":"default"}}}}},"validator":{"$$F":{"data":"function connValidator(dir1, dir2) {\n    return (dir1 == \"input\" && dir2 == \"output\") || (dir1 == \"output\" && dir2 == \"input\") || (dir1 == \"omni\") || (dir2 == \"omni\");\n}"}},"wireData":{"params":{},"type":{"$$C":{"name":"WireCatenary","type":"widget"}}}},"id":11,"type":"ConnWidget","pos":{"x":-296,"y":-259},"addons":{"left":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":13,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"left","widget":11}}},"2":{"$$I":{"name":"ConnectorAddon","type":"addon","group":14,"data":{"params":{"positioning":0.9,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":2,"edge":"left","widget":11}}}},"right":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":15,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"right","widget":11}}},"2":{"$$I":{"name":"ConnectorAddon","type":"addon","group":16,"data":{"params":{"positioning":0.9,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":2,"edge":"right","widget":11}}}},"top":{},"bottom":{}},"d":{"connType":"peer","routerId":"","connId":"","channel":"default"}}}},"14":{"$$I":{"name":"WireLine","type":"widget","group":1,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":false},"id":14,"type":"WireLine","pos":{"x":-100,"y":119.6875},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":2,"edge":"right","widget":5},"hasAddon":true},"point2":{"addon":{"id":2,"edge":"left","widget":2},"hasAddon":true}}}}},"16":{"$$I":{"name":"WireCatenary","type":"widget","group":1,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true,"drop":100,"segments":15,"tensionCoef":0.001},"id":16,"type":"WireCatenary","pos":{"x":-101,"y":-117.3125},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":2,"edge":"right","widget":11},"hasAddon":true},"point2":{"addon":{"id":2,"edge":"left","widget":8},"hasAddon":true}}}}},"24":{"$$I":{"name":"WireOrth","type":"widget","group":1,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":false},"id":24,"type":"WireOrth","pos":{"x":0,"y":0},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"right","widget":8},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"left","widget":2},"hasAddon":true}}}}}},"nested":[]})

setInterval(() => {
  // localStorage.setItem("save", JSON.stringify(scene.save()));
  // console.log(JSON.stringify(scene.save()));
}, 1000);
