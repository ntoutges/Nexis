// basis for everything in the module
import { Draggable } from "./draggable.js";
import { Listener } from "./listener.js";
import { ContextMenuItem, ContextMenuSection } from "./widgets/contextmenu/items.js";
export class FrameworkBase {
    el = document.createElement("div");
    contextmenus = {};
    resizeData = {
        option: null,
        dragEl: null,
        draggable: null
    };
    constructor({ name, parent = null, id = null, children = [], style, resize = "none", contextmenu = {} }) {
        this.el.classList.add("frameworks");
        this.resizeData.option = resize;
        const names = name.split(" ");
        for (const partialName of names) {
            this.el.classList.add(`framework-${partialName}`);
        }
        if (id)
            this.el.setAttribute("id", id);
        for (const child of children) {
            this.el.append(child);
        }
        if (this.resizeData.option != "none") {
            this.resizeData.dragEl = document.createElement("div");
            this.resizeData.dragEl.classList.add("framework-resize-drag-element", `framework-dir-${this.resizeData.option}`);
            this.el.append(this.resizeData.dragEl);
        }
        if (parent)
            this.appendTo(parent);
        if (style) {
            for (const property in style) {
                this.el.style[property] = style[property];
            }
        }
        setTimeout(() => {
            for (const name in contextmenu) {
                this.contextmenus[name] = new ContextMenu({
                    //       items: sectionsBuilder(contextmenu[name].options),
                    items: [],
                    trigger: contextmenu[name].el
                });
            }
        });
    }
    hide() { this.el.classList.add("hiddens"); }
    show() { this.el.classList.remove("hiddens"); }
    appendTo(parent) {
        parent.append(this.el);
        if (this.resizeData.dragEl) {
            if (!this.resizeData.draggable) { // buld new draggable
                this.resizeData.draggable = new Draggable({
                    viewport: parent,
                    element: this.resizeData.dragEl,
                    zoomable: false,
                    scrollX: ["horizontal", "both"].includes(this.resizeData.option),
                    scrollY: ["vertical", "both"].includes(this.resizeData.option),
                    blockDrag: true,
                    blockScroll: true
                });
                this.resizeData.draggable.listener.on("drag", this.manualResizeTo.bind(this));
                this.resizeData.draggable.listener.on("resize", () => { }); // force constant resize/scale calculation
            }
            else
                this.resizeData.draggable.changeViewport(parent); // modify old draggable
        }
    }
    get element() {
        return this.el;
    }
    manualResizeTo(d) {
        const newWidth = this.el.offsetWidth - d.delta.x;
        const newHeight = this.el.offsetHeight + d.delta.y;
        this.el.style.width = `${newWidth}px`;
        this.el.style.height = `${newHeight}px`;
        d.listener.trigger("resize", d);
    }
}
const alignmentMap = {
    "left": 0,
    "top": 0,
    "middle": 0.5,
    "right": 1,
    "bottom": 1
};
// what is put into scenes
export class Widget extends FrameworkBase {
    sceneListeners = new Map();
    sceneListenerIds = new Map(); // keep track of sceneListener ids
    transformations = new Map();
    scene = null;
    layer; // used to store layer until attached to a scene
    positioning;
    pos = { x: 0, y: 0 };
    align = { x: 0, y: 0 };
    name;
    constructor({ id, name, style, content, positioning = 1, layer = 100 - Math.round(positioning * 100), // default makes elements positioned "closer" to the background lower in layer
    pos = {}, resize,
    // contextmenu = {}
     }) {
        super({
            name: `${name}-widget widget`,
            children: [content],
            style, id,
            resize
        });
        this.name = name;
        this.positioning = positioning;
        this.layer = layer;
        this.align.x = alignmentMap[pos?.xAlign ?? "left"];
        this.align.y = alignmentMap[pos?.yAlign ?? "top"];
        this.setPos(pos?.x ?? 0, pos?.y ?? 0);
    }
    setPos(x, y) {
        this.pos.x = x;
        this.pos.y = y;
    }
    setZoom(z) { } // placeholder for future functions that may need this
    calculateBounds(scale = 1) {
        return {
            width: this.el.offsetWidth * scale,
            height: this.el.offsetHeight * scale
        };
    }
    addSceneListener(type, sceneListener) {
        this.sceneListeners.set(type, sceneListener);
    }
    attachTo(scene) {
        const isFirstScene = this.scene == null;
        if (!isFirstScene)
            this.detachFrom(this.scene);
        this.scene = scene;
        this.setZoom(scene.draggable.pos.z);
        for (const [type, listener] of this.sceneListeners.entries()) {
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
            this.resizeData.draggable.listener.on("resize", this.updatePositionOnResize.bind(this));
        }
    }
    detachFrom(scene) {
        if (this.scene != scene)
            return; // scenes don't match
        this.scene = null;
        if (this.sceneListenerIds.has(scene.identifier)) {
            for (const listenerId of this.sceneListenerIds.get(scene.identifier)) {
                scene.off(listenerId);
            }
        }
        this.el.remove();
        scene.removeWidget(this);
    }
    saveId(sceneIdentifier, callbackId) {
        if (!this.sceneListenerIds.has(sceneIdentifier))
            this.sceneListenerIds.set(sceneIdentifier, []);
        this.sceneListenerIds.get(sceneIdentifier).push(callbackId);
    }
    setTransformation(property, value = "") {
        if (value.length == 0)
            this.transformations.delete(property); // delete property
        else
            this.transformations.set(property, value); // add property
        this.updateTransformations();
    }
    updateTransformations() {
        let transformations = [];
        for (const [property, value] of this.transformations.entries()) {
            transformations.push(`${property}(${value})`);
        }
        this.el.style.transform = transformations.join(",");
    }
    setZIndex(zIndex) {
        this.el.style.zIndex = zIndex.toString();
    }
    updatePositionOnResize(d) {
        const xOff = d.delta.x * this.align.x;
        const yOff = d.delta.y * this.align.y;
        this.pos.x -= xOff;
        this.pos.y += yOff;
    }
}
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
export class ContextMenu extends GlobalSingleUseWidget {
    sections;
    container;
    listener = new Listener();
    constructor({ id, layer = 999999, pos, positioning, resize, style, items, trigger }) {
        const container = document.createElement("div");
        super({
            id, layer, pos, positioning, resize, style,
            name: "contextmenu",
            content: container,
            options: {
                autobuild: false
            }
        });
        container.classList.add("framework-contextmenu-containers");
        if (items.length > 0) {
            if (items[0] instanceof ContextMenuSection)
                this.sections = items;
            else {
                this.sections = [
                    new ContextMenuSection({
                        items: items
                    })
                ];
            }
        }
        this.sections.forEach(section => { section.setListener(this.listener); });
        this.container = container;
        this.listener.on("add", () => { if (this.isBuilt)
            this.rebuild(); });
        if (!Array.isArray(trigger))
            trigger = [trigger];
        for (const el of trigger) {
            el.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!this.scene)
                    return; // don't continue unless attached to something
                this.build();
                this.scene.setWidgetPos(this, e.pageX, e.pageY);
                this.listener.trigger("open", null);
            });
            el.addEventListener("click", (e) => {
                if (e.button == 2)
                    return; // ignore right-click
                this.unbuild();
            });
        }
    }
    rebuild() {
        this.container.innerHTML = ""; // clear
        const sectionElements = this.sections.map(section => section.build());
        for (const sectionEl of sectionElements) {
            this.container.append(sectionEl);
        }
    }
    build() {
        this.rebuild();
        super.build();
    }
    unbuild() {
        this.container.innerHTML = "";
        this.listener.trigger("close", null);
        super.unbuild();
    }
    addSection(section) {
        this.sections.push(section);
    }
    removeSection(name) {
        const section = this.getSection(name);
        if (section == null)
            return;
        const index = this.sections.indexOf(section);
        section.unbuild()?.remove();
        this.sections.splice(index, 1);
    }
    getSection(name) {
        if (typeof name == "number") { // given exact index
            if (name < 0)
                name += this.sections.length;
            if (name >= 0 && name < this.sections.length) {
                return this.sections[name];
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
}
// format: value//name//icon//shortcut
export function itemBuilder(input) {
    const parts = input.split("/");
    const buildData = { value: "" };
    if (parts.length == 0)
        return null;
    buildData.value = parts[0];
    if (parts.length > 1 && parts[1].trim())
        buildData.name = parts[1];
    if (parts.length > 2 && parts[2].trim())
        buildData.icon = parts[2];
    if (parts.length > 3 && parts[3].trim())
        buildData.shortcut = parts[3];
    return new ContextMenuItem(buildData);
}
// format: ;name;<item>;<item>;...
const sectionPattern = /^(?:;([^;]+))?(.+?)$/;
export function sectionBuilder(input) {
    const sectionData = sectionPattern.exec(input);
    if (!sectionData)
        return null;
    const name = sectionData[1] ?? null;
    const items = [];
    const itemsData = (sectionData[2] ?? "").split(";");
    for (const itemInput of itemsData) {
        const item = itemBuilder(itemInput);
        if (item == null)
            continue; // throw out
        items.push(item);
    }
    if (items.length == 0)
        return null;
    return new ContextMenuSection({
        items,
        name
    });
}
// format: <section>~<section>~...
export function sectionsBuilder(input) {
    const sectionsData = input.split("~");
    const sections = [];
    for (const sectionData of sectionsData) {
        const section = sectionBuilder(sectionData);
        if (section == null)
            continue; // throw out
        sections.push(section);
    }
    return sections;
}
//# sourceMappingURL=framework.js.map