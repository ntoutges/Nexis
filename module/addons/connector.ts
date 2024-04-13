import { Listener } from "../listener.js";
import { WireBase, WirePoint } from "../widgets/wire/base.js";
import { WireLine } from "../widgets/wire/line.js";
import { Addon } from "./addons.js";

const styles = new Map<string, Record<string, string>>();
const styleUsers = new Map<string, ConnectorAddon<any>[]>();

type config_t = {
  removeDuplicates: boolean
};

export class ConnectorAddon<Direction extends string> extends Addon {
  readonly connListener = new Listener<"move", "">();
  readonly type: string;
  readonly direction: Direction;

  private scenepointermoveId: number = null;
  private scenepointerupId: number = null;

  private wireInProgress: WireBase = null;
  private readonly validator: (addon1: Direction, addon2: Direction) => boolean
  private readonly buildConfig: config_t;

  private readonly points: { point: WirePoint, listener: number, wire: WireBase }[] = [];
  readonly sender = new Listener<"send" | "receive" | "connect" | "disconnect", any>();

  readonly wireData: {
    type: { new(...args: any[]): WireBase },
    params: Record<string, any>
  }

  /**
   * @param validator This is a function that, when called, should return true if the connection is valid, and false otherwise. If unset, this will act as a function that always returns true 
   */
  constructor({
    type,
    positioning = 0.5,
    direction,
    wireData = null,
    config = {},
    validator = null
  }: {
    positioning?: number
    type: string
    direction: Direction
    validator?: (addon1: Direction, addon2: Direction) => boolean
    config?: Partial<config_t>,
    wireData?: {
      type: { new(...args: any[]): WireBase }
      params: Record<string,any>
    }
  }) {
    const el = document.createElement("div");
    el.classList.add("framework-addon-connectors", `framework-addon-connectors-${direction}`);

    super({
      content: el,
      circleness: 1,
      positioning,
      size: 14
    });

    const styleName = ConnectorAddon.getStyleName(type, direction);
    if (!styleUsers.has(styleName)) styleUsers.set(styleName, []);
    styleUsers.get(styleName).push(this);

    this.type = type;
    this.direction = direction;
    this.validator = validator;

    this.wireData = {
      type: wireData?.type ?? WireLine,
      params: wireData?.params ?? {}
    };

    // set defaults in buildConfig
    this.buildConfig = {
      removeDuplicates: config.removeDuplicates ?? true
    };

    this.updateStyle();

    // prevent pointerdown from propagating to some future draggable
    this.el.addEventListener("pointerdown", e => {
      this.interWidgetListener.trigger(`${type}::pointerdown`, this);
      e.stopPropagation();

      this.wireInProgress = new this.wireData.type(this.wireData.params);
      this.addonContainer.widget.scene.addWidget(this.wireInProgress);
      this.wireInProgress.point1.attachToAddon(this);
      this.wireInProgress.setIsEditing(true);

      const initialPos = this.getPositionInScene();
      this.wireInProgress.point2.setPos(initialPos[0], initialPos[1]);

      // update end position of wire
      this.scenepointermoveId = this.sceneElListener.on("pointermove", (e) => {
        const [sceneX, sceneY] = this.addonContainer.widget.scene.draggable.toSceneSpace((e as MouseEvent).pageX, (e as MouseEvent).pageY)
        this.wireInProgress.point2.setPos(sceneX, sceneY);
      });

      // remove wire (dropped somewhere in the scene)
      this.scenepointerupId = this.sceneElListener.on("pointerup", () => {
        this.disconnectSceneMouseListeners();
        this.removeWireInProgress();
      });
    });

    // remove wire (dropped on the input node)
    this.el.addEventListener("pointerup", e => {
      e.stopPropagation();
      this.disconnectSceneMouseListeners();
      this.removeWireInProgress();

      this.interWidgetListener.trigger(`${type}::pointerup`, this);
    });

    // finalize wire (attach to opposite node)
    this.interWidgetListener.on(`${type}::pointerup`, other => {
      if (!this.wireInProgress) return;

      let passesBuildConfig = true;
      if (this.buildConfig.removeDuplicates) { // duplicates not allowed
        const duplicate = this.getDuplicateWire(other as ConnectorAddon<Direction>);
        if (duplicate !== null) { // duplicate found
          duplicate.scene.removeWidget(duplicate);
          passesBuildConfig = false;
        }
      }

      if (
        passesBuildConfig 
        && ((this.validator == null) ? true : this.validator(this.direction, (other as ConnectorAddon<Direction>).direction))
      ) {
        this.disconnectSceneMouseListeners();
        this.wireInProgress.point2.attachToAddon(other as ConnectorAddon<Direction>);

        this.setPoint(this.wireInProgress, 1);
        (other as ConnectorAddon<Direction>).setPoint(this.wireInProgress, 2);

        // wire finished, register
        this.addonEdge?.addonContainer.widget?.scene?.registerWire(this.wireInProgress);

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

  private disconnectSceneMouseListeners() {
    if (this.scenepointermoveId == null) return false;
    this.sceneElListener.off(this.scenepointermoveId);
    this.sceneElListener.off(this.scenepointerupId);
    this.scenepointermoveId = null;
    this.scenepointerupId = null;
    return true;
  }

  private removeWireInProgress() {
    if (!this.wireInProgress) return;
    this.addonContainer.widget.scene.removeWidget(this.wireInProgress);
    this.wireInProgress = null;
  }

  setPoint(wire: WireBase, point: 1 | 2): void;
  setPoint(wire: WireBase, point: WirePoint): void;
  setPoint(wire: WireBase, point: WirePoint | 1 | 2) {
    if (typeof point == "number") point = (point == 1) ? wire.point1 : wire.point2;

    this.points.push({
      point,
      wire,
      listener: point.listener.on("receive", data => { this.sender.trigger("receive", data); })
    });
    this.sender.trigger("connect", "");

    point.listener.on("disconnect", this.removePoint.bind(this));
  }

  protected removePoint(point: WirePoint) {
    const index = this.points.findIndex(val => val.point == point);
    if (index == -1) return; // invalid point

    point.listener.off(this.points[index].listener); // stop listening to point
    this.points.splice(index, 1); // remove point altogether
    this.sender.trigger("disconnect", "");
  }

  static setStyle(
    type: string,
    direction: string,
    style: Record<string, string>
  ) {
    const name = ConnectorAddon.getStyleName(type, direction);
    styles.set(
      name,
      style
    );
    if (!styleUsers.has(name)) styleUsers.set(name, []);
    else {
      for (const styleUser of styleUsers.get(name)) {
        styleUser.updateStyle();
      }
    }
  }

  static getStyleName(
    type: string,
    direction: string
  ) {
    return type + ":" + direction;
  }

  static getStyle(
    type: string,
    direction: string
  ) {
    const name = ConnectorAddon.getStyleName(type, direction);
    return styles.has(name) ? styles.get(name) : {};
  }

  // each wire generates a point, which is put into this array
  get wireCount() { return this.points.length; }
  get wires() { return this.points.map(data => data.wire); }

  getDuplicateWire(wire: WireBase): WireBase
  getDuplicateWire(point: ConnectorAddon<Direction>): WireBase
  getDuplicateWire(wire: WireBase | ConnectorAddon<Direction>) {
    let otherAddon: ConnectorAddon<Direction>;
    if (wire instanceof WireBase) {
      if (wire.point1.addon == this) otherAddon = wire.point2.addon as ConnectorAddon<Direction>;
      else if (wire.point2.addon == this) otherAddon = wire.point2.addon as ConnectorAddon<Direction>;
      else return null; // wire shares neither point.addon with this addon, so it CANNOT match
    }
    else otherAddon = wire; // passing in other addon

    // check if second point matches with given wire
    for (const pointData of this.points) {
      const otherWireAddon = (pointData.wire.point1.addon == this) ? pointData.wire.point2.addon : pointData.wire.point1.addon;
      if (otherWireAddon == otherAddon) return pointData.wire; // found matching wire
    }
    return null; // no matching wires found
  }

  setWireData(
    type: { new(...args: any[]): WireBase },
    params: Record<string,any>
  ) {
    this.wireData.type = type;
    this.wireData.params = params;
  }

  // save() {
  //   return {
  //     ...super.save(),

  //   };
  // }

  // saveRef() {
  //   return {
  //     ...super.saveRef(),

  //   }
  // }
};
