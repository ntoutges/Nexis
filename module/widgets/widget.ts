import { Scene } from "../scene.js";
import { FrameworkBase } from "../framework.js";
import { DraggableEvents } from "../interfaces.js";
import { BasicWidgetInterface, sceneListener, SceneListenerTypes } from "./interfaces.js";

var maxLayer: number = 0;

const alignmentMap = {
  "left": 0,
  "top": 0,
  "middle": 0.5,
  "right": 1,
  "bottom": 1
};

// what is put into scenes
export class Widget extends FrameworkBase {
  private readonly sceneListeners: Map<SceneListenerTypes, sceneListener> = new Map<SceneListenerTypes,sceneListener>(); 
  private readonly sceneListenerIds: Map<number, number[]> = new Map<number, number[]>(); // keep track of sceneListener ids
  private readonly transformations = new Map<string, string>();

  protected scene: Scene = null;
  private layer: number; // used to store layer until attached to a scene

  readonly positioning: number;

  readonly pos = { x:0, y:0 };
  readonly align = { x:0, y:0 };

  readonly name: string;

  constructor({
    id,name,style,
    content,
    positioning = 1,
    layer = 100 - Math.round(positioning * 100), // default makes elements positioned "closer" to the background lower in layer
    pos = {}
  }: BasicWidgetInterface) {
    super({
      name: `${name}-widget widget`,
      children: [content],
      style,id
    });

    this.name = name;

    this.positioning = positioning;
    this.layer = layer;

    this.align.x = alignmentMap[pos?.xAlign ?? "left"];
    this.align.y = alignmentMap[pos?.yAlign ?? "top"];

    this.setPos(
      pos?.x ?? 0,
      pos?.y ?? 0
    );
  }

  setPos(x: number, y: number) {
    this.pos.x = x;
    this.pos.y = y;
  }

  setZoom(z: number) {} // placeholder for future functions that may need this

  calculateBounds(scale: number = 1) {
    return {
      width: this.el.offsetWidth * scale,
      height: this.el.offsetHeight * scale
    };
  }

  addSceneListener(type: SceneListenerTypes, sceneListener: sceneListener) {
    this.sceneListeners.set(type, sceneListener);
  }

  attachTo(scene: Scene) {
    if (this.scene) this.detachFrom(this.scene);
    this.scene = scene;
    this.setZoom(scene.draggable.pos.z);
    for (const [type,listener] of this.sceneListeners.entries()) {
      switch (type) {
        case "init":
          this.saveId(scene.identifier, scene.onD("init", listener));
          break;
        case "dragStart":
          this.saveId(scene.identifier, scene.onD("dragInit", listener));
          break;
        case "dragEnd":
          this.saveId(scene.identifier, scene.onD("dragEnd", listener));
          break;
        case "drag":
          this.saveId(scene.identifier, scene.onD("drag", listener));
          break;
        case "zoom":
          this.saveId(scene.identifier, scene.onD("scroll", listener));
          break;
        case "move":
          this.saveId(scene.identifier, scene.onD("drag", listener));
          this.saveId(scene.identifier, scene.onD("scroll", listener));
          break;
        case "resize":
          this.saveId(scene.identifier, scene.onD("resize", listener));
          break;
        default:
          console.log(`Invalid SceneListenerType ${type}`);
      }
    }
    scene.layers.setLayer(this, this.layer);
    scene.element.append(this.el);
  }

  detachFrom(scene: Scene) {
    if (this.scene != scene) return; // scenes don't match
    this.scene = null;
    if (this.sceneListenerIds.has(scene.identifier)) {
      for (const listenerId of this.sceneListenerIds.get(scene.identifier)) {
        scene.off(listenerId);
      }
    }
    this.el.remove();
    scene.removeWidget(this);
  }

  private saveId(sceneIdentifier: number, callbackId: number) {
    if (!this.sceneListenerIds.has(sceneIdentifier)) this.sceneListenerIds.set(sceneIdentifier, []);
    this.sceneListenerIds.get(sceneIdentifier).push(callbackId);
  }

  setTransformation(property: string, value: string = "") {
    if (value.length == 0) this.transformations.delete(property); // delete property
    else this.transformations.set(property, value); // add property

    this.updateTransformations();
  }

  protected updateTransformations() {
    let transformations: string[] = [];
    for (const [property,value] of this.transformations.entries()) {
      transformations.push(`${property}(${value})`);
    }
    this.el.style.transform = transformations.join(",");
  }

  setZIndex(zIndex: number) {
    this.el.style.zIndex = zIndex.toString();
  }
}