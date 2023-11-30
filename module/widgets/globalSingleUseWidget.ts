import { BasicWidgetInterface, GlobalSingleUseWidgetInterface } from "./interfaces.js";
import { Widget } from "./widget.js";

const globalSingleUseWidgetMap = new Map<string, GlobalSingleUseWidget>();

export function unbuildType(type: string) {
  if (globalSingleUseWidgetMap.has(type)) {
    globalSingleUseWidgetMap.get(type).unbuild();
  }
}

export abstract class GlobalSingleUseWidget extends Widget {
  private _isBuilt: boolean;
  constructor({
    name,content,
    id,layer,pos,positioning,resize,style,
    options
  }: GlobalSingleUseWidgetInterface) {
    super({
      name,content,
      id,layer,
      pos,positioning,resize,
      style
    });
    this._isBuilt = false;

    if (options?.autobuild ?? true) {
      setTimeout(() => { this.build() }); // taking advantage of event system; wait for parent constructor to finish before calling build
    }
    this.el.style.display = "none";
  }
  
  build() {
    if (globalSingleUseWidgetMap.has(this.name)) { // get rid of old
      const oldWidget = globalSingleUseWidgetMap.get(this.name);
      if (oldWidget != this) oldWidget.unbuild();
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