import { Pos } from "../pos.js";
import { DraggableWidget } from "../widgets/draggable-widget.js";
import { Addon } from "./base.js";

export class LimitAddon extends Addon {
    private readonly accumulatedMove = new Pos<"x" | "y">({});
    private ignoreMove = false; // Allow addon to move widget without triggering infinte loop
    private _enabled: boolean = true;

    private readonly limits: {
        minX: number
        minY: number
        maxX: number
        maxY: number
    };

    constructor({
        limit,
        positioning = 0,
        visible = false,
        weight = 1
    }: {
        limit: {
            x?: [min: number, max: number]
            y?: [min: number, max: number]
        }
        positioning?: number
        visible?: boolean
        weight?: number
    }) {
        super({
            content: document.createElement("div"),
            circleness: 1,
            positioning,
            size: visible ? 14 : 0,
            weight,
            priority: 100
        });

        this.addInitParams({ limit, visible, positioning, weight }, "*")

        this.limits = {
            minX: limit.hasOwnProperty("x") ? limit.x[0] : -Infinity,
            maxX: limit.hasOwnProperty("x") ? limit.x[1] : Infinity,
            minY: limit.hasOwnProperty("y") ? limit.y[0] : -Infinity,
            maxY: limit.hasOwnProperty("y") ? limit.y[1] : Infinity
        };

        this.listener.on("move", this.applyLimits.bind(this));
        this.listener.on("dragend", this.resetAccumulator.bind(this));

        this.el.classList.add("nexis-addon-limits");
    }

    private applyLimits() {
        if (!this._enabled || this.ignoreMove || !this.addonContainer?.widget?.scene) return;

        this.ignoreMove = true;
        setTimeout(() => this.ignoreMove = false, 0);

        let [x,y] = this.getPositionInScene(true);
        
        x = Math.min(Math.max(x - this.accumulatedMove.getPosComponent("x"), this.limits.minX), this.limits.maxX);
        y = Math.min(Math.max(y - this.accumulatedMove.getPosComponent("y"), this.limits.minY), this.limits.maxY);

        this.setAddonPos(x, y, true);
    }

    // Hijack to add in accumulator
    protected offsetWidgetPos(deltaX: number, deltaY: number, accumulate: boolean = true) {
        super.offsetWidgetPos(deltaX, deltaY);
        if (accumulate) this.accumulatedMove.offsetPos({ x: deltaX, y: deltaY });
    }

    private resetAccumulator() {
        this.accumulatedMove.setPos({ x: 0, y: 0 });
    }

    enable() { this._enabled = true; }
    disable() { this._enabled = false; }

    get enabled() { return this._enabled; }
}