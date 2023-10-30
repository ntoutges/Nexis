import { FrameworkBase } from "../framework.js";
var maxLayer = 0;
const alignmentMap = {
    "left": 0,
    "top": 0,
    "middle": 0.5,
    "right": 1,
    "bottom": 1
};
// what is put into scenes
export class Widget extends FrameworkBase {
    sceneListeners = new Map();
    sceneListenerIds = new Map(); // keep track of sceneListener ids
    transformations = new Map();
    scene = null;
    positioning;
    layer;
    pos = { x: 0, y: 0 };
    align = { x: 0, y: 0 };
    constructor({ id, name, style, content, positioning = 1, layer = 0, pos = {} }) {
        super({
            name: `${name}-widget widget`,
            children: [content],
            style, id
        });
        this.positioning = positioning;
        this.setLayer(layer);
        this.align.x = alignmentMap[pos?.xAlign ?? "left"];
        this.align.y = alignmentMap[pos?.yAlign ?? "top"];
        this.setPos(pos?.x ?? 0, pos?.y ?? 0);
    }
    setPos(x, y) {
        this.pos.x = x;
        this.pos.y = y;
    }
    setZoom(z) { } // placeholder for future functions that may need this
    calculateBounds(scale = 1) {
        return {
            width: this.el.offsetWidth * scale,
            height: this.el.offsetHeight * scale
        };
    }
    addSceneListener(type, sceneListener) {
        this.sceneListeners.set(type, sceneListener);
    }
    attachTo(scene) {
        this.scene = scene;
        this.setZoom(scene.draggable.pos.z);
        for (const [type, listener] of this.sceneListeners.entries()) {
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
        scene.element.append(this.el);
    }
    detachFrom(scene) {
        if (!this.sceneListenerIds.has(scene.identifier))
            return; // no ids set
        if (this.scene == scene)
            this.scene = null;
        for (const listenerId of this.sceneListenerIds.get(scene.identifier)) {
            scene.off(listenerId);
        }
    }
    saveId(sceneIdentifier, callbackId) {
        if (!this.sceneListenerIds.has(sceneIdentifier))
            this.sceneListenerIds.set(sceneIdentifier, []);
        this.sceneListenerIds.get(sceneIdentifier).push(callbackId);
    }
    setLayer(layer) {
        this.layer = layer;
        this.el.style.zIndex = this.layer.toString();
        if (this.layer > maxLayer) {
            maxLayer = this.layer;
        }
    }
    setTransformation(property, value = "") {
        if (value.length == 0)
            this.transformations.delete(property); // delete property
        else
            this.transformations.set(property, value); // add property
        this.updateTransformations();
    }
    updateTransformations() {
        let transformations = [];
        for (const [property, value] of this.transformations.entries()) {
            transformations.push(`${property}(${value})`);
        }
        this.el.style.transform = transformations.join(",");
    }
    bringToTop() {
        this.setLayer(maxLayer + 1);
    }
}
//# sourceMappingURL=widget.js.map