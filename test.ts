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

ConnectorAddon.setStyle("data", "input", { background: "white" });
ConnectorAddon.setStyle("data", "output", { background: "black" });
ConnectorAddon.setStyle("data", "omni", { background: "radial-gradient(black, black 50%, white 50%, white)" });

const $ = document.querySelector.bind(document);

declare const Peer: any;
declare const io: any;

let socket: any;

try {
  socket = io();
} catch(err) {
  console.log("'io' is not defined; Try running server/server.js");
}

const peerConn = new PeerConnection({
  Peer,
  prefix: "framework"
});
const socketConn = new SocketConnection({
  socket
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
    //     "local": new LocalConnection({}),
    //     "socket": socketConn
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
    //     "local": new LocalConnection({}),
    //     "socket": socketConn
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

scene.objectRepository.addObject("widget", WireCatenary);
scene.objectRepository.addObject("widget", WireLine);
scene.objectRepository.addObject("widget", ConnConsole);
scene.objectRepository.addObject("widget", GridWidget);
scene.objectRepository.addObject("widget", ConnWidget);

scene.objectRepository.addObject("wire", WireLine);
scene.objectRepository.addObject("wire", WireCatenary);

scene.objectRepository.addObject("+conn", LocalConnection);
scene.objectRepository.addObject("+conn", PeerConnection, { Peer });
scene.objectRepository.addObject("+conn", SocketConnection, { socket });

const load = localStorage.getItem("save");
try {
  // if (load) scene.load(JSON.parse(load));
} catch(err) { localStorage.removeItem("save"); }

scene.load({"widgets":{"0":{"$$I":{"name":"GridWidget","type":"widget","group":1,"data":{"params":{"style":{"background":"cornsilk"},"resize":"none","positioning":0,"doZoomScale":true,"layer":-1,"pos":{},"options":{"coords":true},"doCursorDragIcon":true,"doIndependentCenter":false,"gridChangeScaleFactor":0.4},"id":0,"type":"GridWidget","pos":{"x":0,"y":0},"addons":{"left":{},"right":{},"top":{},"bottom":{}}}}},"2":{"$$I":{"name":"ConnWidget","type":"widget","group":1,"data":{"params":{"type":"data","connections":{"peer":{"$$I":{"name":"PeerConnection","type":"+conn","group":1,"data":{"params":{"prefix":"framework"}}}},"local":{"$$I":{"name":"LocalConnection","type":"+conn","group":1,"data":{"params":{"worldId":"default"}}}},"socket":{"$$I":{"name":"SocketConnection","type":"+conn","group":1,"data":{"params":{}}}}},"validator":{"$$F":{"data":"function connValidator(dir1, dir2) {\n    return (dir1 == \"input\" && dir2 == \"output\") || (dir1 == \"output\" && dir2 == \"input\") || (dir1 == \"omni\") || (dir2 == \"omni\");\n}"}}},"id":2,"type":"ConnWidget","pos":{"x":226,"y":-308},"addons":{"left":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":1,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":null,"config":{}},"id":1,"edge":"left","widget":2}}},"2":{"$$I":{"name":"ConnectorAddon","type":"addon","group":2,"data":{"params":{"positioning":0.9,"weight":100,"circleness":1,"size":14,"type":"data","wireData":null,"config":{}},"id":2,"edge":"left","widget":2}}}},"right":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":3,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":null,"config":{}},"id":1,"edge":"right","widget":2}}},"2":{"$$I":{"name":"ConnectorAddon","type":"addon","group":4,"data":{"params":{"positioning":0.9,"weight":100,"circleness":1,"size":14,"type":"data","wireData":null,"config":{}},"id":2,"edge":"right","widget":2}}}},"top":{},"bottom":{}},"d":{"connType":"socket","routerId":"","connId":"router","channel":"default"}}}},"5":{"$$I":{"name":"ConnWidget","type":"widget","group":2,"data":{"params":{"type":"data","connections":{"peer":{"$$I":{"name":"PeerConnection","type":"+conn","group":1,"data":{"params":{"prefix":"framework"}}}},"local":{"$$I":{"name":"LocalConnection","type":"+conn","group":2,"data":{"params":{"worldId":"default"}}}},"socket":{"$$I":{"name":"SocketConnection","type":"+conn","group":1,"data":{"params":{}}}}},"validator":{"$$F":{"data":"function connValidator(dir1, dir2) {\n    return (dir1 == \"input\" && dir2 == \"output\") || (dir1 == \"output\" && dir2 == \"input\") || (dir1 == \"omni\") || (dir2 == \"omni\");\n}"}}},"id":5,"type":"ConnWidget","pos":{"x":-477,"y":-309},"addons":{"left":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":5,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":null,"config":{}},"id":1,"edge":"left","widget":5}}},"2":{"$$I":{"name":"ConnectorAddon","type":"addon","group":6,"data":{"params":{"positioning":0.9,"weight":100,"circleness":1,"size":14,"type":"data","wireData":null,"config":{}},"id":2,"edge":"left","widget":5}}}},"right":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":7,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":null,"config":{}},"id":1,"edge":"right","widget":5}}},"2":{"$$I":{"name":"ConnectorAddon","type":"addon","group":8,"data":{"params":{"positioning":0.9,"weight":100,"circleness":1,"size":14,"type":"data","wireData":null,"config":{}},"id":2,"edge":"right","widget":5}}}},"top":{},"bottom":{}},"d":{"connType":"socket","routerId":"router","connId":"conn","channel":"default"}}}},"8":{"$$I":{"name":"ConnConsole","type":"widget","group":1,"data":{"params":{"type":"data","wireData":{"params":{},"type":{"$$C":{"name":"WireCatenary","type":"wire"}}},"validator":{"$$F":{"data":"function connValidator(dir1, dir2) {\n    return (dir1 == \"input\" && dir2 == \"output\") || (dir1 == \"output\" && dir2 == \"input\") || (dir1 == \"omni\") || (dir2 == \"omni\");\n}"}}},"id":8,"type":"ConnConsole","pos":{"x":497,"y":-191},"size":{"x":200,"y":224},"addons":{"left":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":9,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"left","widget":8}}}},"right":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":10,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"right","widget":8}}}},"top":{},"bottom":{}},"d":{"text":null}}}},"16":{"$$I":{"name":"ConnConsole","type":"widget","group":2,"data":{"params":{"type":"data","wireData":{"params":{},"type":{"$$C":{"name":"WireCatenary","type":"wire"}}},"validator":{"$$F":{"data":"function connValidator(dir1, dir2) {\n    return (dir1 == \"input\" && dir2 == \"output\") || (dir1 == \"output\" && dir2 == \"input\") || (dir1 == \"omni\") || (dir2 == \"omni\");\n}"}}},"id":16,"type":"ConnConsole","pos":{"x":222,"y":-126},"size":{"x":200,"y":224},"addons":{"left":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":11,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"left","widget":16}}}},"right":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":12,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"right","widget":16}}}},"top":{},"bottom":{}},"d":{"text":null}}}},"20":{"$$I":{"name":"ConnConsole","type":"widget","group":3,"data":{"params":{"type":"data","wireData":{"params":{},"type":{"$$C":{"name":"WireCatenary","type":"wire"}}},"validator":{"$$F":{"data":"function connValidator(dir1, dir2) {\n    return (dir1 == \"input\" && dir2 == \"output\") || (dir1 == \"output\" && dir2 == \"input\") || (dir1 == \"omni\") || (dir2 == \"omni\");\n}"}}},"id":20,"type":"ConnConsole","pos":{"x":-250,"y":-194},"size":{"x":200,"y":224},"addons":{"left":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":13,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"left","widget":20}}}},"right":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":14,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"right","widget":20}}}},"top":{},"bottom":{}},"d":{"text":null}}}},"28":{"$$I":{"name":"ConnConsole","type":"widget","group":4,"data":{"params":{"type":"data","wireData":{"params":{},"type":{"$$C":{"name":"WireCatenary","type":"wire"}}},"validator":{"$$F":{"data":"function connValidator(dir1, dir2) {\n    return (dir1 == \"input\" && dir2 == \"output\") || (dir1 == \"output\" && dir2 == \"input\") || (dir1 == \"omni\") || (dir2 == \"omni\");\n}"}}},"id":28,"type":"ConnConsole","pos":{"x":-480,"y":-125},"size":{"x":200,"y":224},"addons":{"left":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":15,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"left","widget":28}}}},"right":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","group":16,"data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"right","widget":28}}}},"top":{},"bottom":{}},"d":{"text":null}}}},"42":{"$$I":{"name":"WireCatenary","type":"widget","group":1,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true,"drop":100,"segments":15,"tensionCoef":0.001},"id":42,"type":"WireCatenary","pos":{"x":224,"y":-219.5},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"left","widget":2},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"right","widget":16},"hasAddon":true}}}}},"54":{"$$I":{"name":"WireCatenary","type":"widget","group":2,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true,"drop":100,"segments":15,"tensionCoef":0.001},"id":54,"type":"WireCatenary","pos":{"x":421,"y":-166.3125},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"left","widget":8},"hasAddon":true},"point2":{"addon":{"id":2,"edge":"right","widget":2},"hasAddon":true}}}}},"58":{"$$I":{"name":"WireCatenary","type":"widget","group":3,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true,"drop":100,"segments":15,"tensionCoef":0.001},"id":58,"type":"WireCatenary","pos":{"x":-282,"y":-167.3125},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"left","widget":20},"hasAddon":true},"point2":{"addon":{"id":2,"edge":"right","widget":5},"hasAddon":true}}}}},"60":{"$$I":{"name":"WireCatenary","type":"widget","group":4,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true,"drop":100,"segments":15,"tensionCoef":0.001},"id":60,"type":"WireCatenary","pos":{"x":-482,"y":-220.5},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"right","widget":5},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"left","widget":28},"hasAddon":true}}}}},"62":{"$$I":{"name":"WireCatenary","type":"widget","group":5,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true,"drop":100,"segments":15,"tensionCoef":0.001},"id":62,"type":"WireCatenary","pos":{"x":220,"y":-219.5},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"left","widget":16},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"right","widget":2},"hasAddon":true}}}}},"64":{"$$I":{"name":"WireCatenary","type":"widget","group":6,"data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true,"drop":100,"segments":15,"tensionCoef":0.001},"id":64,"type":"WireCatenary","pos":{"x":-479,"y":-220.5},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"right","widget":28},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"left","widget":5},"hasAddon":true}}}}}},"nested":[]})

setInterval(() => {
  // localStorage.setItem("save", JSON.stringify(scene.save()));
  // console.log(JSON.stringify(scene.save()));
}, 1000);
