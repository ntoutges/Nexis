import { Listener } from "../listener.js";
import { BasicWire } from "../widgets/wire.js";
import { Addon } from "./addons.js";
const styles = new Map();
const styleUsers = new Map();
export class ConnectorAddon extends Addon {
    connListener = new Listener();
    type;
    direction;
    sceneMousemoveId = null;
    sceneMouseupId = null;
    wireInProgress = null;
    validator;
    points = [];
    sender = new Listener();
    /**
     * @param validator This is a function that, when called, should return true if the connection is valid, and false otherwise. If unset, this will act as a function that always returns true
     */
    constructor({ type, positioning = 0.5, direction, validator = null }) {
        const el = document.createElement("div");
        el.classList.add("framework-addon-connectors", `framework-addon-connectors-${direction}`);
        super({
            content: el,
            circleness: 1,
            positioning,
            size: 14
        });
        const styleName = ConnectorAddon.getStyleName(type, direction);
        if (!styleUsers.has(styleName))
            styleUsers.set(styleName, []);
        styleUsers.get(styleName).push(this);
        this.type = type;
        this.direction = direction;
        this.validator = validator;
        this.updateStyle();
        // prevent mousedown from propagating to some future draggable
        this.el.addEventListener("mousedown", e => {
            this.interWidgetListener.trigger(`${type}::mousedown`, this);
            e.stopPropagation();
            this.wireInProgress = new BasicWire();
            this.addonContainer.widget.scene.addWidget(this.wireInProgress);
            this.wireInProgress.point1.attachToAddon(this);
            this.wireInProgress.setIsEditing(true);
            const initialPos = this.getPositionInScene();
            this.wireInProgress.point2.setPos(initialPos[0], initialPos[1]);
            // update end position of wire
            this.sceneMousemoveId = this.sceneElListener.on("mousemove", (e) => {
                const [sceneX, sceneY] = this.addonContainer.widget.scene.draggable.toSceneSpace(e.pageX, e.pageY);
                this.wireInProgress.point2.setPos(sceneX, sceneY);
            });
            // remove wire (dropped somewhere in the scene)
            this.sceneMouseupId = this.sceneElListener.on("mouseup", () => {
                this.disconnectSceneMouseListeners();
                this.removeWireInProgress();
            });
        });
        // remove wire (dropped on the input node)
        this.el.addEventListener("mouseup", e => {
            e.stopPropagation();
            this.interWidgetListener.trigger(`${type}::mouseup`, this);
            this.disconnectSceneMouseListeners();
            this.removeWireInProgress();
        });
        // finalize wire (attach to opposite node)
        this.interWidgetListener.on(`${type}::mouseup`, other => {
            if (!this.wireInProgress)
                return;
            if ((this.validator == null) ? true : this.validator(this.direction, other.direction)) {
                this.disconnectSceneMouseListeners();
                this.wireInProgress.point2.attachToAddon(other);
                this.setPoint(this.wireInProgress.point1);
                other.setPoint(this.wireInProgress.point2);
                this.wireInProgress.setIsEditing(false);
                this.wireInProgress = null;
            }
            else { // invalid wire, remove it
                this.disconnectSceneMouseListeners();
                this.removeWireInProgress();
            }
        });
        this.sender.on("send", data => {
            this.points.forEach(pointData => { pointData.point.listener.trigger("send", data); });
        });
    }
    updateStyle() {
        const style = ConnectorAddon.getStyle(this.type, this.direction);
        for (const styleProperty in style) {
            this.contentEl.style[styleProperty] = style[styleProperty];
        }
    }
    disconnectSceneMouseListeners() {
        if (this.sceneMousemoveId == null)
            return false;
        this.sceneElListener.off(this.sceneMousemoveId);
        this.sceneElListener.off(this.sceneMouseupId);
        this.sceneMousemoveId = null;
        this.sceneMouseupId = null;
        return true;
    }
    removeWireInProgress() {
        if (!this.wireInProgress)
            return;
        this.addonContainer.widget.scene.removeWidget(this.wireInProgress);
        this.wireInProgress = null;
    }
    setPoint(point) {
        this.points.push({
            point,
            listener: point.listener.on("receive", data => { this.sender.trigger("receive", data); })
        });
        this.sender.trigger("connect", "");
        point.listener.on("disconnect", this.removePoint.bind(this));
    }
    removePoint(point) {
        const index = this.points.findIndex(val => val.point == point);
        if (index == -1)
            return; // invalid point
        point.listener.off(this.points[index].listener); // stop listening to point
        this.points.splice(index, 1); // remove point altogether
        this.sender.trigger("disconnect", "");
    }
    static setStyle(type, direction, style) {
        const name = ConnectorAddon.getStyleName(type, direction);
        styles.set(name, style);
        if (!styleUsers.has(name))
            styleUsers.set(name, []);
        else {
            for (const styleUser of styleUsers.get(name)) {
                styleUser.updateStyle();
            }
        }
    }
    static getStyleName(type, direction) {
        return type + ":" + direction;
    }
    static getStyle(type, direction) {
        const name = ConnectorAddon.getStyleName(type, direction);
        return styles.has(name) ? styles.get(name) : {};
    }
    // each wire generates a point, which is put into this array
    get wireCount() {
        return this.points.length;
    }
}
//# sourceMappingURL=connector.js.map