import { Listener } from "../listener.js";
import { BasicWire } from "../widgets/wire.js";
import { Addon } from "./addons.js";

export class ConnectorAddon<Direction> extends Addon {
  readonly connListener = new Listener<"move", "">();
  readonly type: string;
  readonly direction: Direction;

  private sceneMousemoveId: number = null;
  private sceneMouseupId: number = null;

  private wireInProgress: BasicWire = null;
  readonly validator: (addon1: ConnectorAddon<Direction>, addon2: ConnectorAddon<Direction>) => boolean

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
    validator?: (addon1: ConnectorAddon<Direction>, addon2: ConnectorAddon<Direction>) => boolean
  }) {
    const el = document.createElement("div");
    el.classList.add("framework-addon-connectors", `framework-addon-connectors-${direction}`);

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
      
      if ((this.validator == null) ? true : this.validator(this, other as ConnectorAddon<Direction>)) {
        this.disconnectSceneMouseListeners();
        this.wireInProgress.point2.attachToAddon(other as ConnectorAddon<Direction>);
        this.wireInProgress = null;
      }
      else { // invalid wire, remove it
      this.disconnectSceneMouseListeners();
      this.removeWireInProgress();
      }
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
}