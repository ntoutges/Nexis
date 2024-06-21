import { Grid, Pos } from "./module/pos.js";
import { Scene } from "./module/scene.js";
import { Addon, AddonTest } from "./module/addons/base.js";
import { DraggableWidget } from "./module/widgets/draggable-widget.js";
import { GridWidget } from "./module/widgets/grid.js";
import { ConnectorAddon } from "./module/addons/connector.js";
import { AttachableListener } from "./module/attachableListener.js";
import { Listener } from "./module/listener.js";
import { PeerConnection } from "./connection/lib/distros/peer.js";
import { FAnimation } from "./module/animation.js";
import { ConnConsole, ConnWidget } from "./module/widgets/prefabs/connWidget.js";
import { WireLine } from "./module/widgets/wire/line.js";
import { WireCatenary } from "./module/widgets/wire/catenary.js";
import { AddonEdgeAlias } from "./module/addons/alias.js";
import { LocalConnection } from "./connection/lib/distros/local.js";

ConnectorAddon.setStyle("data", "input", { background: "white" });
ConnectorAddon.setStyle("data", "output", { background: "black" });
ConnectorAddon.setStyle("data", "omni", { background: "radial-gradient(black, black 50%, white 50%, white)" });

const $ = document.querySelector.bind(document);

declare const Peer: any;
const peerConn = new PeerConnection(Peer, "framework");
const localConn = new LocalConnection();

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
    //     "local": new LocalConnection()
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
    //     "local": new LocalConnection()
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
    //     "local": new LocalConnection()
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
    //     "local": new LocalConnection()
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

scene.load({"widgets":{"0":{"$$I":{"name":"GridWidget","type":"widget","data":{"params":{"style":{"background":"cornsilk"},"resize":"none","positioning":0,"doZoomScale":true,"layer":-1,"pos":{},"options":{"coords":true},"doCursorDragIcon":true,"doIndependentCenter":false,"gridChangeScaleFactor":0.4},"id":0,"type":"GridWidget","pos":{"x":0,"y":0},"addons":{"left":{},"right":{},"top":{},"bottom":{}}}}},"2":{"$$I":{"name":"ConnWidget","type":"widget","data":{"params":{"type":"data"},"id":2,"type":"ConnWidget","pos":{"x":284,"y":192},"addons":{"left":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"left","widget":2}}},"2":{"$$I":{"name":"ConnectorAddon","type":"addon","data":{"params":{"positioning":0.9,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":2,"edge":"left","widget":2}}}},"right":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"right","widget":2}}},"2":{"$$I":{"name":"ConnectorAddon","type":"addon","data":{"params":{"positioning":0.9,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":2,"edge":"right","widget":2}}}},"top":{},"bottom":{}}}}},"5":{"$$I":{"name":"ConnWidget","type":"widget","data":{"params":{"type":"data"},"id":5,"type":"ConnWidget","pos":{"x":68,"y":193},"addons":{"left":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"left","widget":5}}},"2":{"$$I":{"name":"ConnectorAddon","type":"addon","data":{"params":{"positioning":0.9,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":2,"edge":"left","widget":5}}}},"right":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"right","widget":5}}},"2":{"$$I":{"name":"ConnectorAddon","type":"addon","data":{"params":{"positioning":0.9,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":2,"edge":"right","widget":5}}}},"top":{},"bottom":{}}}}},"8":{"$$I":{"name":"ConnWidget","type":"widget","data":{"params":{"type":"data"},"id":8,"type":"ConnWidget","pos":{"x":-147,"y":192},"addons":{"left":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"left","widget":8}}},"2":{"$$I":{"name":"ConnectorAddon","type":"addon","data":{"params":{"positioning":0.9,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":2,"edge":"left","widget":8}}}},"right":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"right","widget":8}}},"2":{"$$I":{"name":"ConnectorAddon","type":"addon","data":{"params":{"positioning":0.9,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":2,"edge":"right","widget":8}}}},"top":{},"bottom":{}}}}},"11":{"$$I":{"name":"ConnWidget","type":"widget","data":{"params":{"type":"data"},"id":11,"type":"ConnWidget","pos":{"x":-366,"y":195},"addons":{"left":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"left","widget":11}}},"2":{"$$I":{"name":"ConnectorAddon","type":"addon","data":{"params":{"positioning":0.9,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":2,"edge":"left","widget":11}}}},"right":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"right","widget":11}}},"2":{"$$I":{"name":"ConnectorAddon","type":"addon","data":{"params":{"positioning":0.9,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":2,"edge":"right","widget":11}}}},"top":{},"bottom":{}}}}},"14":{"$$I":{"name":"ConnConsole","type":"widget","data":{"params":{"type":"data","wireData":{"params":{},"type":{"$$C":{"name":"WireCatenary","type":"wire"}}}},"id":14,"type":"ConnConsole","pos":{"x":-378,"y":-158},"addons":{"left":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"left","widget":14}}}},"right":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"right","widget":14}}}},"top":{},"bottom":{}}}}},"18":{"$$I":{"name":"ConnConsole","type":"widget","data":{"params":{"type":"data","wireData":{"params":{},"type":{"$$C":{"name":"WireLine","type":"wire"}}}},"id":18,"type":"ConnConsole","pos":{"x":-160,"y":-390},"addons":{"left":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"left","widget":18}}}},"right":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"right","widget":18}}}},"top":{},"bottom":{}}}}},"22":{"$$I":{"name":"ConnConsole","type":"widget","data":{"params":{"type":"data","wireData":{"params":{},"type":{"$$C":{"name":"WireCatenary","type":"wire"}}}},"id":22,"type":"ConnConsole","pos":{"x":-378,"y":-391},"addons":{"left":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"left","widget":22}}}},"right":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14,"type":"data","wireData":{"params":{}},"config":{}},"id":1,"edge":"right","widget":22}}}},"top":{},"bottom":{}}}}},"26":{"$$I":{"name":"WireCatenary","type":"widget","data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true,"drop":100,"segments":15,"tensionCoef":0.001},"id":26,"type":"WireCatenary","pos":{"x":-180,"y":-269},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"right","widget":22},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"left","widget":18},"hasAddon":true}}},"dependencies":[22,18]}},"28":{"$$I":{"name":"WireLine","type":"widget","data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":false},"id":28,"type":"WireLine","pos":{"x":-378,"y":-266},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"right","widget":18},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"left","widget":14},"hasAddon":true}}},"dependencies":[18,14]}},"32":{"$$I":{"name":"WireCatenary","type":"widget","data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true,"drop":100,"segments":15,"tensionCoef":0.001},"id":32,"type":"WireCatenary","pos":{"x":-368,"y":-36},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"right","widget":14},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"left","widget":11},"hasAddon":true}}},"dependencies":[14,11]}},"34":{"$$I":{"name":"WireCatenary","type":"widget","data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true,"drop":100,"segments":15,"tensionCoef":0.001},"id":34,"type":"WireCatenary","pos":{"x":-171,"y":280.5},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"right","widget":11},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"left","widget":8},"hasAddon":true}}},"dependencies":[11,8]}},"36":{"$$I":{"name":"WireCatenary","type":"widget","data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true,"drop":100,"segments":15,"tensionCoef":0.001},"id":36,"type":"WireCatenary","pos":{"x":48,"y":280.5},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"right","widget":8},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"left","widget":5},"hasAddon":true}}},"dependencies":[8,5]}},"38":{"$$I":{"name":"WireCatenary","type":"widget","data":{"params":{"width":2,"color":"black","shadow":"white","pointerless":true,"drop":100,"segments":15,"tensionCoef":0.001},"id":38,"type":"WireCatenary","pos":{"x":263,"y":280.5},"addons":{"left":{},"right":{},"top":{},"bottom":{}},"wire":{"point1":{"addon":{"id":1,"edge":"right","widget":5},"hasAddon":true},"point2":{"addon":{"id":1,"edge":"left","widget":2},"hasAddon":true}}},"dependencies":[5,2]}}},"nested":[]});
console.log(scene)

// setInterval(() => {
//   console.log(JSON.stringify(scene.save()));
// }, 1000);
