import { Listener } from "../listener.js";
import { BasicWire, WirePoint } from "../widgets/wire.js";
import { Addon } from "./addons.js";

const styles = new Map<string, Record<string, string>>();

export class ConnectorAddon<Direction extends string> extends Addon {
  readonly connListener = new Listener<"move", "">();
  readonly type: string;
  readonly direction: Direction;

  private sceneMousemoveId: number = null;
  private sceneMouseupId: number = null;

  private wireInProgress: BasicWire = null;
  readonly validator: (addon1: Direction, addon2: Direction) => boolean

  private readonly points: {point: WirePoint, listener: number }[] = [];
  readonly sender = new Listener<"send" | "receive" | "connect" | "disconnect", any>();

  /**
   * @param validator This is a function that, when called, should return true if the connection is valid, and false otherwise. If unset, this will act as a function that always returns true 
   */
  constructor({
    type,
    positioning = 0.5,
    direction,
    validator = null
  }: {
    positioning?: number
    type: string
    direction: Direction
    validator?: (addon1: Direction, addon2: Direction) => boolean
  }) {
    const el = document.createElement("div");
    el.classList.add("framework-addon-connectors", `framework-addon-connectors-${direction}`);

    const style = ConnectorAddon.getStyle(type, direction);
    for (const styleProperty in style) {
      el.style[styleProperty] = style[styleProperty];
    }

    super({
      content: el,
      circleness: 1,
      positioning,
      size: 14
    });

    this.type = type;
    this.direction = direction;
    this.validator = validator;

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
        const [ sceneX, sceneY ] = this.addonContainer.widget.scene.draggable.toSceneSpace((e as MouseEvent).pageX, (e as MouseEvent).pageY)
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
      if (!this.wireInProgress) return;
      
      if ((this.validator == null) ? true : this.validator(this.direction, (other as ConnectorAddon<Direction>).direction)) {
        this.disconnectSceneMouseListeners();
        this.wireInProgress.point2.attachToAddon(other as ConnectorAddon<Direction>);
        
        this.setPoint(this.wireInProgress.point1);
        (other as ConnectorAddon<Direction>).setPoint(this.wireInProgress.point2);
        
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

  private disconnectSceneMouseListeners() {
    if (this.sceneMousemoveId == null) return false;
    this.sceneElListener.off(this.sceneMousemoveId);
    this.sceneElListener.off(this.sceneMouseupId);
    this.sceneMousemoveId = null;
    this.sceneMouseupId = null;
    return true;
  }

  private removeWireInProgress() {
    if (!this.wireInProgress) return;
    this.addonContainer.widget.scene.removeWidget(this.wireInProgress);
    this.wireInProgress = null;
  }

  protected setPoint(point: WirePoint) {
    this.points.push({
      point,
      listener: point.listener.on("receive", data => { this.sender.trigger("receive", data); })
    });
    this.sender.trigger("connect", "");

    point.listener.on("disconnect", this.removePoint.bind(this));
  }

  protected removePoint(point: WirePoint) {
    const index = this.points.findIndex(val => val.point == point);
    if (index == -1) return; // invalid point
    
    point.listener.off(this.points[index].listener); // stop listening to point
    this.points.splice(index,1); // remove point altogether
    this.sender.trigger("disconnect", "");
  }

  static createStyle(
    type: string,
    direction: string,
    style: Record<string,string>
  ) {
    styles.set(
      type + ":" + direction,
      style
    );
  }

  static getStyle(
    type: string,
    direction: string
  ) {
    const key = type + ":" + direction;
    return styles.has(key) ? styles.get(key) : {};
  }

  // each wire generates a point, which is put into this array
  get wireCount() {
    return this.points.length;
  }
}
