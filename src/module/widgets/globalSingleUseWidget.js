import { Widget } from "./widget.js";
const globalSingleUseWidgetMap = new Map();
export function unbuildType(type) {
    if (globalSingleUseWidgetMap.has(type)) {
        globalSingleUseWidgetMap.get(type).unbuild();
    }
}
export class GlobalSingleUseWidget extends Widget {
    _isBuilt;
    constructor({ name, content, id, layer, pos, positioning, resize, style, options }) {
        super({
            name, content,
            id, layer,
            pos, positioning, resize,
            style
        });
        this._isBuilt = false;
        if (options?.autobuild ?? true) {
            setTimeout(() => { this.build(); }); // taking advantage of event system; wait for parent constructor to finish before calling build
        }
        this.el.style.display = "none";
    }
    build() {
        if (globalSingleUseWidgetMap.has(this.name)) { // get rid of old
            const oldWidget = globalSingleUseWidgetMap.get(this.name);
            if (oldWidget != this)
                oldWidget.unbuild();
        }
        globalSingleUseWidgetMap.set(this.name, this);
        this._isBuilt = true;
        this.el.style.display = "";
    }
    unbuild() {
        this._isBuilt = false;
        this.el.style.display = "none";
        if (globalSingleUseWidgetMap.has(this.name)) {
            globalSingleUseWidgetMap.delete(this.name); // remove current entry
        }
    }
    get isBuilt() { return this._isBuilt; }
}
//# sourceMappingURL=globalSingleUseWidget.js.map