import { Pos } from "../pos.js";
import { Addon } from "./base.js";
export class SnapAddon extends Addon {
    accumulatedMove = new Pos({});
    ignoreMove = false; // Allow addon to move widget without triggering infinte loop
    _enabled = true;
    activeProfiles = new Set();
    constructor({ content, circleness = 1, positioning = 0, size = 14, weight = 1, priority = 0, active = {} }) {
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
        if (active.normal !== false)
            this.activeProfiles.add("normal");
        if (active.minimize !== false)
            this.activeProfiles.add("minimize");
        this.el.classList.add("nexis-addon-snaps");
    }
    updateDeltas() {
        if (!this._enabled || this.ignoreMove || !this.active)
            return; // Ignoring move; Not yet attached to widget or scene
        // Ignore any immediate moves by the widget
        this.ignoreMove = true;
        setTimeout(() => this.ignoreMove = false, 0);
        this.updateWidgetPos(this.accumulatedMove.getPosComponent("x"), this.accumulatedMove.getPosComponent("y"));
    }
    // Hijack to add in accumulator
    offsetWidgetPos(deltaX, deltaY, accumulate = true) {
        super.offsetWidgetPos(deltaX, deltaY);
        if (accumulate)
            this.accumulatedMove.offsetPos({ x: deltaX, y: deltaY });
    }
    resetAccumulator() {
        this.accumulatedMove.setPos({ x: 0, y: 0 });
    }
    enable() { this._enabled = true; }
    disable() { this._enabled = false; }
    get enabled() { return this._enabled; }
    get active() {
        if (!this.addonContainer?.widget?.scene)
            return false;
        if (this.addonContainer.widget.isDraggable) {
            const minimized = this.addonContainer.widget.isDraggable && this.addonContainer.widget.isMinimized;
            // Enforce active profiles
            return !((minimized && !this.activeProfiles.has("minimize"))
                || (!minimized && !this.activeProfiles.has("normal")));
        }
        return true;
    }
}
export class GridSnapAddon extends SnapAddon {
    gridSize;
    gridOffsetX;
    gridOffsetY;
    constructor({ positioning = 0, visible = false, weight = 1, active = {}, grid }) {
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
    updateWidgetPos(accX, accY) {
        const [x, y] = this.getPositionInScene();
        // Round to nearest location
        const desiredX = Math.round((x - this.gridOffsetX) / this.gridSize) * this.gridSize + this.gridOffsetX;
        const desiredY = Math.round((y - this.gridOffsetY) / this.gridSize) * this.gridSize + this.gridOffsetY;
        this.setAddonPos(desiredX - Math.round(accX / this.gridSize) * this.gridSize, desiredY - Math.round(accY / this.gridSize) * this.gridSize);
    }
}
export class ConnectorSnapAddon extends SnapAddon {
    static snapAddons = new Map;
    static styles = new Map();
    static styleUsers = new Map();
    attachedScene = null;
    snapRadius;
    isHost;
    onlyOne;
    clients = new Set();
    type;
    direction;
    validator;
    constructor({ type, direction, config = {}, active, circleness = 1, positioning = 0.5, size = 14, weight = 1, validator = null }) {
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
    trackSelf() {
        this.attachedScene = this.addonContainer.widget.scene;
        // Add self to tracked addons
        if (!ConnectorSnapAddon.snapAddons.has(this.attachedScene))
            ConnectorSnapAddon.snapAddons.set(this.attachedScene, new Map());
        ConnectorSnapAddon.snapAddons.get(this.attachedScene).set(this, new Pos({}));
    }
    untrackSelf() {
        // Remove self from attached scenes
        ConnectorSnapAddon.snapAddons.get(this.attachedScene)?.delete(this);
        // Remove scene container if no snap addons left
        if (ConnectorSnapAddon.snapAddons.get(this.attachedScene)?.size == 0)
            ConnectorSnapAddon.snapAddons.delete(this.attachedScene);
    }
    get clientCt() { return this.clients.size; }
    updateWidgetPos(accX, accY) {
        // Possible violation of only-one; Don't even check
        if (this.onlyOne && this.clients.size > 0) {
            this.updateClientPos();
            return;
        }
        const closestAddon = this.getClosestPoint(accX ** 2 + accY ** 2);
        if (!closestAddon) { // No addon found close enough
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
    getClosestPoint(sqAccRadius) {
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
    getClosePoints(sqAccRadius) {
        const [x, y] = this.getPositionInScene();
        const snapPoints = ConnectorSnapAddon.snapAddons.get(this.attachedScene);
        if (!snapPoints || !snapPoints.has(this))
            return null; // No snap points available // Self not in snap points
        // Update position in list
        snapPoints.get(this)?.setPos({ x, y });
        // Square this so no sqrt operation required
        const maxDist = this.snapRadius ** 2 - sqAccRadius;
        let closeAddons = [];
        // Look for snap widget
        for (const [snapAddon, pos] of snapPoints) {
            if (snapAddon == this || !snapAddon.enabled || !snapAddon.active)
                continue; // Ignore self
            const dist = (x - pos.getPosComponent("x")) ** 2 + (y - pos.getPosComponent("y")) ** 2;
            if (dist <= maxDist
                && this.type == snapAddon.type
                && (!snapAddon.onlyOne || snapAddon.clientCt == 0)
                && (!this.validator || this.validator(this, snapAddon))) { // Current addon is too far away to be considered
                closeAddons.push([snapAddon, dist]);
            }
        }
        return closeAddons;
    }
    attachClientAddon(other) {
        if (this.clients.has(other))
            return;
        this.clients.add(other);
        // if (!this.isHost && other.isHost) this.el.classList.add("nexis-addon-snaps-hidden");
        other.attachClientAddon(this);
        return true;
    }
    detachClientAddon(other) {
        if (!this.clients.has(other))
            return;
        this.clients.delete(other);
        // if (!this.isHost && other.isHost) this.el.classList.remove("nexis-addon-snaps-hidden");
        other.detachClientAddon(this);
    }
    updateClientsPre() {
        const removeAll = !this.enabled || !this.active;
        for (const point of this.clients) { // Remove disabled/inactive points
            if (removeAll || !point.enabled || !point.active)
                this.detachClientAddon(point);
        }
    }
    updateClientsPost() {
        const closePoints = this.getClosePoints(0).map(data => data[0]);
        for (const point of closePoints) {
            if (this.clients.has(point))
                continue;
            this.attachClientAddon(point);
        }
        if (!this.isHost) {
            const closePointsSet = new Set(closePoints);
            // Remove points that are too far away
            for (const point of this.clients) {
                if (closePointsSet.has(point))
                    continue;
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
    updateClientPos() {
        if (!this.isHost)
            return;
        const [x, y] = this.getPositionInScene();
        for (const client of this.clients) {
            client.setAddonPos(x, y, false);
        }
    }
    static setStyle(type, direction, style) {
        const name = ConnectorSnapAddon.getStyleName(type, direction);
        ConnectorSnapAddon.styles.set(name, style);
        if (!ConnectorSnapAddon.styleUsers.has(name))
            ConnectorSnapAddon.styleUsers.set(name, []);
        else {
            for (const styleUser of ConnectorSnapAddon.styleUsers.get(name)) {
                styleUser.updateStyle();
            }
        }
    }
    static getStyleName(type, direction) {
        return type + ":" + direction;
    }
    static getStyle(type, direction) {
        const name = ConnectorSnapAddon.getStyleName(type, direction);
        return ConnectorSnapAddon.styles.has(name) ? ConnectorSnapAddon.styles.get(name) : {};
    }
}
//# sourceMappingURL=snap.js.map