import { Draggable } from "../draggable.js";
import { FrameworkBase } from "../framework.js";
import { ContextMenuEvents, ContextMenuItemInterface } from "../interfaces";
import { ElementListener, Listener } from "../listener.js";
import { Grid, Pos, SnapPos } from "../pos.js";
import { Scene } from "../scene.js";
import { AddonContainer } from "./addons.js";
import { ContextMenuItem, ContextMenuSection } from "./contextmenuItems.js";
import { BasicWidgetInterface, ContextMenuInterface, GlobalSingleUseWidgetInterface, SceneListenerTypes, sceneListener } from "./interfaces.js";

const alignmentMap = {
  "left": 0,
  "top": 0,
  "middle": 0.5,
  "right": 1,
  "bottom": 1
};

// what is put into scenes
export class Widget extends FrameworkBase {
  private readonly sceneListeners: Map<SceneListenerTypes, sceneListener> = new Map<SceneListenerTypes,sceneListener>(); 
  private readonly sceneListenerIds: Map<number, number[]> = new Map<number, number[]>(); // keep track of sceneListener ids
  private readonly transformations = new Map<string, string>();
  readonly contextmenus: Record<string,ContextMenu> = {};
  readonly addons = new AddonContainer();

  readonly elListener = new ElementListener();

  protected scene: Scene = null;
  private layer: number; // used to store layer until attached to a scene

  readonly positioning: number;
  readonly doZoomScale: boolean;

  readonly pos = new SnapPos<"x"|"y">({}, 20);
  readonly align = { x:0, y:0 };

  readonly name: string;

  constructor({
    id,name,style,
    content,
    positioning = 1,
    doZoomScale = true,
    layer = 100 - Math.round(positioning * 100), // default makes elements positioned "closer" to the background lower in layer
    pos = {},
    resize,
    contextmenu = [],
  }: BasicWidgetInterface) {
    super({
      name: `${name}-widget widget`,
      children: [content],
      style,id,
      resize,
    });

    this.name = name;
    this.elListener.observe(this.el);

    this.positioning = positioning;
    this.doZoomScale = doZoomScale;
    this.layer = layer;

    this.align.x = alignmentMap[pos?.xAlign ?? "left"];
    this.align.y = alignmentMap[pos?.yAlign ?? "top"];

    this.setPos(
      pos?.x ?? 0,
      pos?.y ?? 0
    );

    if (Array.isArray(contextmenu)) {
      if (contextmenu.length == 0) contextmenu = {};
      else if (contextmenu.length == 1) contextmenu = contextmenu[0];
      else {
        const base = contextmenu[contextmenu.length-1]; // fill list back-to-front
        for (let i = contextmenu.length-2; i >= 0; i--) {
          ContextMenu.combineContextMenus( base, contextmenu[i] );
        }
        contextmenu = base;
      }
    }
    for (const name in contextmenu) {
      this.contextmenus[name] = new ContextMenu({
        items: ContextMenu.sectionsBuilder(contextmenu[name].options),
        trigger: contextmenu[name].el
      });
    }

    this.elListener.on("resize", this.addons.updateAddonPositions.bind(this.addons));

    this.addons.appendTo(this.el);
  }

  setPos(x: number, y: number) {
    this.pos.setPos({x,y});
  }

  setZoom(z: number) {
    if (!this.doZoomScale) this.setTransformation("scale", "1"); // force scale to not change
  }

  calculateBounds(scale: number = 1) {
    return {
      width: this.el.offsetWidth * scale,
      height: this.el.offsetHeight * scale
    };
  }

  addSceneListener(type: SceneListenerTypes, sceneListener: sceneListener) {
    this.sceneListeners.set(type, sceneListener);
  }

  attachTo(scene: Scene) {
    const isFirstScene = this.scene == null;
    if (!isFirstScene) this.detachFrom(this.scene);
    this.scene = scene;
    this.setZoom(scene.draggable.pos.z);
    for (const [type,listener] of this.sceneListeners.entries()) {
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
    scene.layers.setLayer(this, this.layer);
    this.appendTo(scene.element);
    if (isFirstScene && this.resizeData.draggable) {
      this.resizeData.draggable.listener.on("resize", this.updatePositionOnResize.bind(this))
    }
    for (const name in this.contextmenus) {
      scene.addWidget(this.contextmenus[name]);
    }
  }

  detachFrom(scene: Scene) {
    if (this.scene != scene) return; // scenes don't match
    this.scene = null;
    if (this.sceneListenerIds.has(scene.identifier)) {
      for (const listenerId of this.sceneListenerIds.get(scene.identifier)) {
        scene.off(listenerId);
      }
    }
    this.el.remove();
    scene.removeWidget(this);
  }

  private saveId(sceneIdentifier: number, callbackId: number) {
    if (!this.sceneListenerIds.has(sceneIdentifier)) this.sceneListenerIds.set(sceneIdentifier, []);
    this.sceneListenerIds.get(sceneIdentifier).push(callbackId);
  }

  setTransformation(property: string, value: string = "") {
    if (value.length == 0) this.transformations.delete(property); // delete property
    else this.transformations.set(property, value); // add property

    this.updateTransformations();
  }

  protected updateTransformations() {
    let transformations: string[] = [];
    for (const [property,value] of this.transformations.entries()) {
      transformations.push(`${property}(${value})`);
    }
    this.el.style.transform = transformations.join(",");
  }

  setZIndex(zIndex: number) {
    this.el.style.zIndex = zIndex.toString();
  }

  protected updatePositionOnResize(d: Draggable) {
    const xOff = d.delta.x * this.align.x;
    const yOff = d.delta.y * this.align.y;

    this.pos.offsetPos({
      x: -xOff,
      y: yOff
    });
  }

  get isBuilt(): boolean { return true; } // used by types like GlobalSingleUseWidget for scene optimization
}

const globalSingleUseWidgetMap = new Map<string, GlobalSingleUseWidget>();

export abstract class GlobalSingleUseWidget extends Widget {
  private _isBuilt: boolean;
  constructor({
    name,content,
    id,layer,pos,positioning,resize,style,
    options,
    doZoomScale
  }: GlobalSingleUseWidgetInterface) {
    super({
      name,content,
      id,layer,
      pos,positioning,resize,
      style,
      doZoomScale
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

  static unbuildType(type: string) {
    if (globalSingleUseWidgetMap.has(type)) {
      globalSingleUseWidgetMap.get(type).unbuild();
    }
  }
}

const sectionPattern = /^(?:;([^;]+))?(.+?)$/;
export class ContextMenu extends GlobalSingleUseWidget {
  private readonly sections: ContextMenuSection[];
  private readonly container: HTMLDivElement;
  readonly listener = new Listener<ContextMenuEvents, ContextMenuItem>();

  private doAutoClose: boolean;

  constructor({
    id,pos,positioning,resize,style,
    layer=999999,
    items,
    trigger
  }: ContextMenuInterface) {
    const container = document.createElement("div");

    super({
      id,layer,pos,positioning,resize,style,
      name: "contextmenu",
      content: container,
      options: {
        autobuild: false
      },
      doZoomScale: false
    });

    container.classList.add("framework-contextmenu-containers");
    container.addEventListener("mousedown", (e) => { e.stopPropagation(); }); // block dragging
    container.addEventListener("contextmenu", (e) => { e.preventDefault(); }) // prevent real context-menu on fake context-menu

    if (items.length > 0) {
      if (items[0] instanceof ContextMenuSection) this.sections = items as ContextMenuSection[];
      else {
        this.sections = [
          new ContextMenuSection({
            items: items as ContextMenuItem[]
          })
        ]
      }
      this.sections.forEach(section => { section.setListener(this.listener); });
    }
    else this.sections = [];

    this.container = container;
    
    this.listener.on("add", () => { if (this.isBuilt) this.rebuild(); });
    this.listener.on("click", () => {
      if (this.doAutoClose) this.unbuild();
      this.doAutoClose = false; // reset 
    }, 0); // priority of 0, will wait until all else executed

    if (!Array.isArray(trigger)) trigger = [trigger];
    for (const el of trigger) {
      el.addEventListener("contextmenu", (e) => {
        if (this.sections.length > 0) e.preventDefault(); // if empty, allow standard contextmenu through (but still close previous contextmenu)
        e.stopPropagation();
        if (!this.scene) return; // don't continue unless attached to something
        this.build();
        this.scene.setWidgetPos(this, e.pageX, e.pageY);
        this.listener.trigger("open", null);
      });
    }
  }

  private rebuild() {
    this.container.innerHTML = ""; // clear
    const sectionElements = this.sections.map(section => section.build());
    for (const sectionEl of sectionElements) {
      this.container.append(sectionEl);
    }
  }

  build() {
    this.doAutoClose = true;
    if (!this.isEmpty()) this.rebuild(); // don't bother trying to build empty contextmenu
    super.build();
  }

  unbuild() {
    this.container.innerHTML = "";
    this.listener.trigger("close", null);
    super.unbuild();
  }

  addSection(section: ContextMenuSection) {
    this.sections.push(section);
  }
  removeSection(name: string | number) {
    const section = this.getSection(name);
    if (section == null) return;
    const index = this.sections.indexOf(section);
    
    section.unbuild()?.remove();
    this.sections.splice(index,1);
  }

  getSection(name: string | number): ContextMenuSection {
    if (typeof name == "number") { // given exact index
      if (name < 0) name += this.sections.length;
      if (name >= 0 && name < this.sections.length) {
        return this.sections[name]
      }
      return null;
    }

    // given name
    for (const section of this.sections) {
      if (section.name == name) {
        return section;
      }
    }
    return null;
  }

  size() {
    let total = 0;
    this.sections.forEach(section => { total += section.size(); });
    return total;
  }

  /**
   * Call this to prevent the contextmenu from closing when clicked
   */
  blockClosing() {
    this.doAutoClose = false;
  }

  // format: <value>/<name>/<icon>/<shortcut>
  static itemBuilder(input: string): ContextMenuItem {
    const parts = input.split("/");
    
    const buildData: ContextMenuItemInterface = { value: "" };
  
    if (parts.length == 1 && parts[0].length == 0) return null;
    buildData.value = parts[0];
    
    if (parts.length > 1 && parts[1].trim()) buildData.name = parts[1];
    if (parts.length > 2 && parts[2].trim()) buildData.icon = parts[2];
    if (parts.length > 3 && parts[3].trim()) buildData.shortcut = parts[3];
  
    return new ContextMenuItem(buildData);
  }

  isEmpty() { return this.sections.length == 0; }

  // format: ;name;<item>;<item>;...
  static sectionBuilder(input: string): ContextMenuSection {
    const sectionData = sectionPattern.exec(input);
    if (!sectionData) return null;
  
    const name = (sectionData[1]?.trim()) || null;
    const items: ContextMenuItem[] = [];
    
    const itemsData = (sectionData[2] ?? "").split(";");
    for (const itemInput of itemsData) {
      const item = ContextMenu.itemBuilder(itemInput);
      if (item == null) continue; // throw out
      items.push(item);
    }
  
    if (items.length == 0) return null;
    return new ContextMenuSection({
      items,
      name
    });
  }

  // format: <section>~<section>~...
  static sectionsBuilder(input: string): ContextMenuSection[] {
    const sectionsData = input.split("~");
  
    const sections: ContextMenuSection[] = [];
    for (const sectionData of sectionsData) {
      const section = ContextMenu.sectionBuilder(sectionData);
      if (section == null) continue; // throw out
      sections.push(section);
    }
  
    return sections;
  }

  // copies data from [b] into [a]
  static combineContextMenus(
    a: Record<string, { el: HTMLElement | HTMLElement, options: string }>,
    b: Record<string, { el: HTMLElement | HTMLElement, options: string }>
  ) {
    for (const name in b) {
      if (name in a) {
        const bMatch = sectionPattern.exec(b[name].options);
        if (bMatch[1]) a[name].options += "~"; // new section
        else if (a[name].options.length > 0) a[name].options += ";"; // add separator
        a[name].options += b[name].options;
        if (a[name].el == null) a[name].el = b[name].el; // [a] may leave element undefined; if so, fill with [b]'s element
      }
      else a[name] = b[name];
    }
  }
}
