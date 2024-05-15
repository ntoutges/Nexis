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
    new ConnConsole({
      type: "data",
      validator: connValidator,
      wireData: {
        params: {},
        type: WireCatenary
      }
    }),
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

// scene.load({"widgets":{"0":{"$$I":{"name":"ConnConsole","type":"widget","data":{"params":{"type":"data","wireData":{"params":{},"type":{"$$C":{"name":"WireCatenary","type":"wire"}}}},"id":0,"type":"ConnConsole","pos":{"x":0,"y":0},"addons":{"left":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14},"id":1,"edge":"left","widget":0}}}},"right":{"1":{"$$I":{"name":"ConnectorAddon","type":"addon","data":{"params":{"positioning":0.5,"weight":100,"circleness":1,"size":14},"id":1,"edge":"right","widget":0}}}},"top":{},"bottom":{}}}}}},"nested":[]});

setInterval(() => {
  JSON.stringify(scene.save())
}, 1000)
