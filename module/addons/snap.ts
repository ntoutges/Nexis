import { Pos } from "../pos.js";
import { Scene } from "../scene.js";
import { DraggableWidget } from "../widgets/draggable-widget.js";
import { Addon } from "./base.js";

export abstract class SnapAddon extends Addon {
    private readonly accumulatedMove = new Pos<"x" | "y">({});
    private ignoreMove = false; // Allow addon to move widget without triggering infinte loop
    private _enabled: boolean = true;

    private readonly activeProfiles = new Set<"normal" | "minimize">();

    constructor({
        content,
        circleness = 1,
        positioning = 0,
        size = 14,
        weight = 1,
        priority = 0,
        active = {}
    }: {
        content: HTMLElement
        circleness?: number
        positioning?: number
        size?: number
        weight?: number
        priority?: number
        active?: {
            normal?: boolean
            minimize?: boolean
        }
    }) {
        super({
            content,
            circleness,
            positioning,
            size,
            weight,
            priority
        });

        this.addInitParams({ active, priority });

        this.listener.on("move", this.updateDeltas.bind(this));
        this.listener.on("dragend", this.resetAccumulator.bind(this));

        if (active.normal !== false) this.activeProfiles.add("normal");
        if (active.minimize !== false) this.activeProfiles.add("minimize");
        
        this.el.classList.add("nexis-addon-snaps");
    }

    private updateDeltas() {
        if (!this._enabled || this.ignoreMove || !this.active) return; // Ignoring move; Not yet attached to widget or scene
        
        // Ignore any immediate moves by the widget
        this.ignoreMove = true;
        setTimeout(() => this.ignoreMove = false, 0);
        this.updateWidgetPos(
            this.accumulatedMove.getPosComponent("x"),
            this.accumulatedMove.getPosComponent("y")
        );
    }

    // Hijack to add in accumulator
    protected offsetWidgetPos(deltaX: number, deltaY: number, accumulate: boolean = true) {
        super.offsetWidgetPos(deltaX, deltaY);
        if (accumulate) this.accumulatedMove.offsetPos({ x: deltaX, y: deltaY });
    }

    private resetAccumulator() {
        this.accumulatedMove.setPos({ x: 0, y: 0 });
    }

    /**
     * @param accX The value of the accumulator which, when added to `x`, gives the position the addon would be without interference
     * @param accY The value of the accumulator which, when added to `y`, gives the position the addon would be without interference
     */
    protected abstract updateWidgetPos(accX: number, accY: number): void;

    enable() { this._enabled = true; }
    disable() { this._enabled = false; }

    get enabled() { return this._enabled; }
    get active() {
        if (!this.addonContainer?.widget?.scene) return false;

        if (this.addonContainer.widget.isDraggable) {
            const minimized = this.addonContainer.widget.isDraggable && (this.addonContainer.widget as DraggableWidget).isMinimized;
            
            // Enforce active profiles
            return !((minimized && !this.activeProfiles.has("minimize"))
                 || (!minimized && !this.activeProfiles.has("normal")));
        }

        return true;
    }
}

export class GridSnapAddon extends SnapAddon {
    private gridSize: number;
    private gridOffsetX: number;
    private gridOffsetY: number;

    constructor({
        positioning = 0,
        visible = false,
        weight = 1,
        active = {},
        grid
    }: {
        positioning?: number
        visible?: boolean
        weight?: number
        active?: {
            normal?: boolean
            minimize?: boolean
        }
        grid: {
            size: number
            xOffset?: number
            yOffset?: number
        }
    }) {
        super({
            content: document.createElement("div"),
            active,
            positioning,
            size: visible ? 14 : 0,
            weight,
            circleness: 0,
            priority: 20
        });

        this.addInitParams({ positioning, visible, weight, grid }, "*");

        this.gridSize = (grid.size <= 0) ? 10 : grid.size;
        this.gridOffsetX = grid.xOffset ?? 0;
        this.gridOffsetY = grid.yOffset ?? 0;

        this.el.classList.add("nexis-addons-snap-grids");
    }

    updateWidgetPos(accX: number, accY: number) {
        const [x,y] = this.getPositionInScene();
        
        // Round to nearest location
        const desiredX = Math.round((x - this.gridOffsetX) / this.gridSize) * this.gridSize + this.gridOffsetX;
        const desiredY = Math.round((y - this.gridOffsetY) / this.gridSize) * this.gridSize + this.gridOffsetY;

        this.setAddonPos(
            desiredX - Math.round(accX / this.gridSize) * this.gridSize,
            desiredY - Math.round(accY / this.gridSize) * this.gridSize
        );
    }
}

export class ConnectorSnapAddon<Direction extends string> extends SnapAddon {
    static snapAddons = new Map<Scene, Map<ConnectorSnapAddon<any>, Pos<"x" | "y">>>

    static styles = new Map<string, Record<string, string>>();
    static styleUsers = new Map<string, ConnectorSnapAddon<any>[]>();
    
    private attachedScene: Scene = null;
    private readonly snapRadius: number;
    readonly isHost: boolean;
    readonly onlyOne: boolean;
    
    private readonly clients = new Set<ConnectorSnapAddon<any>>();

    readonly type: string;
    readonly direction: Direction;
    private readonly validator: (addon1: ConnectorSnapAddon<Direction>, addon2: ConnectorSnapAddon<Direction>) => boolean;
    
    constructor({
        type,
        direction,
        config = {},
        active,
        circleness = 1,
        positioning = 0.5,
        size = 14,
        weight = 1,
        validator = null
    }: {
        type: string,
        direction: Direction
        config?: {
            host?: boolean  // If true, this will drag other addons
            snapRadius?: number
            onlyOne?: boolean
        },
        active?: {
            normal?: boolean
            minimize?: boolean
        }
        circleness?: number
        positioning?: number
        size?: number
        weight?: number
        validator?: (addon1: ConnectorSnapAddon<Direction>, addon2: ConnectorSnapAddon<Direction>) => boolean
    }) {
        super({
            content: document.createElement("div"),
            circleness,
            positioning,
            size,
            weight,
            active,
            priority: 10 // Grid takes precedence over this
        });

        this.addInitParams({ type, direction, config, validator }, ["priority"]);

        this.snapRadius = config.snapRadius ?? 14;
        this.isHost = config.host;
        this.onlyOne = config.onlyOne ?? false;

        this.listener.on("open", this.trackSelf.bind(this));
        this.listener.on("close", this.untrackSelf.bind(this));
        this.listener.on("dragend", this.updateClientsPost.bind(this));
        this.listener.on("draginit", this.updateClientsPre.bind(this));

        this.el.classList.add("nexis-addons-snap-connectors");

        this.direction = direction;
        this.type = type;
        this.validator = validator;

        this.updateStyle();
    }

    private trackSelf() {
        this.attachedScene = this.addonContainer.widget.scene;

        // Add self to tracked addons
        if (!ConnectorSnapAddon.snapAddons.has(this.attachedScene)) ConnectorSnapAddon.snapAddons.set(this.attachedScene, new Map());
        ConnectorSnapAddon.snapAddons.get(this.attachedScene).set(this, new Pos({}));
    }

    private untrackSelf() {

        // Remove self from attached scenes
        ConnectorSnapAddon.snapAddons.get(this.attachedScene)?.delete(this);

        // Remove scene container if no snap addons left
        if (ConnectorSnapAddon.snapAddons.get(this.attachedScene)?.size == 0) ConnectorSnapAddon.snapAddons.delete(this.attachedScene)
    }

    get clientCt() { return this.clients.size; }

    protected updateWidgetPos(accX: number, accY: number) {
        this.updatePositionInScene();
        
        // Possible violation of only-one; Don't even check
        if (this.onlyOne && this.clients.size > 0) {
            this.updateClientPos();
            return;
        }

        const closestAddon = this.getClosestPoint(accX ** 2 + accY ** 2);

        if (!closestAddon) {                    // No addon found close enough
            this.offsetWidgetPos(-accX, -accY); // Reset position accumulator
            this.updateClientPos();
            return;
        }

        // Allow host to snap as long as it has no clients
        if (!this.isHost || !this.clients.has(closestAddon)) {
            const pos = ConnectorSnapAddon.snapAddons.get(this.attachedScene).get(closestAddon);
            this.setAddonPos(pos.getPosComponent("x"), pos.getPosComponent("y")); // Snap current addon to other
        }

        // Update position of clients
        this.updateClientPos();
    }

    private getClosestPoint(sqAccRadius: number): ConnectorSnapAddon<any> {
        const closePoints = this.getClosePoints(sqAccRadius);
    
        let closestPoint = null;
        let minDist = Infinity;
        for (const [point, dist] of closePoints) {
            if (dist < minDist) {
                closestPoint = point;
                minDist = dist;
            }
        }

        return closestPoint;
    }

    private updatePositionInScene() {
        const [x,y] = this.getPositionInScene();

        const snapPoints = ConnectorSnapAddon.snapAddons.get(this.attachedScene);
        if (!snapPoints || !snapPoints.has(this)) return null; // No snap points available // Self not in snap points

        // Update position in list
        snapPoints.get(this)?.setPos({ x,y });
    }

    private getClosePoints(sqAccRadius: number) {
        const snapPoints = ConnectorSnapAddon.snapAddons.get(this.attachedScene);
        if (!snapPoints || !snapPoints.has(this)) return null; // No snap points available // Self not in snap points

        const {x,y} = snapPoints.get(this).getPosData(["x", "y"]);

        // Square this so no sqrt operation required
        const maxDist = this.snapRadius ** 2 - sqAccRadius;

        let closeAddons: [addon: ConnectorSnapAddon<any>, dist: number][] = [];

        // Look for snap widget
        for (const [snapAddon, pos] of snapPoints) {
            if (snapAddon == this || !snapAddon.enabled || !snapAddon.active) continue; // Ignore self
        
            const dist = (x - pos.getPosComponent("x")) ** 2 + (y - pos.getPosComponent("y")) ** 2;
            
            if (
                dist <= maxDist
                && this.type == snapAddon.type
                && (!snapAddon.onlyOne || snapAddon.clientCt == 0 || this.clients.has(snapAddon))
                && (!this.validator || this.validator(this, snapAddon))
            ) { // Current addon is too far away to be considered
                closeAddons.push([snapAddon, dist]);
            }
        }

        return closeAddons;
    }

    private attachClientAddon(other: ConnectorSnapAddon<any>) {
        if (this.clients.has(other)) return;
        this.clients.add(other);
        // if (!this.isHost && other.isHost) this.el.classList.add("nexis-addon-snaps-hidden");

        other.attachClientAddon(this);
        return true;
    }

    private detachClientAddon(other: ConnectorSnapAddon<any>) {
        if (!this.clients.has(other)) return;
        this.clients.delete(other);
        // if (!this.isHost && other.isHost) this.el.classList.remove("nexis-addon-snaps-hidden");

        other.detachClientAddon(this);
    }

    private updateClientsPre() {
        const removeAll = !this.enabled || !this.active;
        for (const point of this.clients) { // Remove disabled/inactive points
            if (removeAll || !point.enabled || !point.active)
                this.detachClientAddon(point);
        }
    }

    private updateClientsPost() {
        let closePoints = this.getClosePoints(0).map(data => data[0]);

        if (this.onlyOne && closePoints.length > 1) { // Too many clients
            
            // Use preexisting client
            if (this.clients.size > 0 && closePoints.includes(Array.from(this.clients)[0]))
                closePoints = [Array.from(this.clients)[0]]

            // Narrow to just one option
            else closePoints = [this.getClosestPoint(0)];
        }

        for (const point of closePoints) {
            if (this.clients.has(point)) continue;

            this.attachClientAddon(point);
        }

        if (!this.isHost) {
            const closePointsSet = new Set(closePoints);

            // Remove points that are too far away
            for (const point of this.clients) {
                if (closePointsSet.has(point)) continue;
                this.detachClientAddon(point);
            }
        }
    }

    updateStyle() {
        const style = ConnectorSnapAddon.getStyle(this.type, this.direction);
        for (const styleProperty in style) {
            this.contentEl.style[styleProperty] = style[styleProperty];
            
            // Update outer element background to match
            if (["backgroundColor", "background"].includes(styleProperty))
                this.el.style.background = `linear-gradient(90deg, ${style[styleProperty]} 0%, ${style[styleProperty]} 50%, transparent 50%)`;
        }
    }

    private updateClientPos() {
        if (!this.isHost) return;

        const [x,y] = this.getPositionInScene();
        for (const client of this.clients) {
            client.setAddonPos(x, y, false);
        }
    }

    static setStyle(
        type: string,
        direction: string,
        style: Record<string, string>
    ) {
        const name = ConnectorSnapAddon.getStyleName(type, direction);
        ConnectorSnapAddon.styles.set(
        name,
        style
        );
        if (!ConnectorSnapAddon.styleUsers.has(name)) ConnectorSnapAddon.styleUsers.set(name, []);
        else {
            for (const styleUser of ConnectorSnapAddon.styleUsers.get(name)) {
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
        const name = ConnectorSnapAddon.getStyleName(type, direction);
        return ConnectorSnapAddon.styles.has(name) ? ConnectorSnapAddon.styles.get(name) : {};
    }
}
