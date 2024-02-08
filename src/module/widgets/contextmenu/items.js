import { getIcon } from "../../svg.js";
export class ContextMenuItem {
    _value;
    _name;
    _shortcut;
    _icon;
    listener = null;
    el = null;
    constructor({ value, name = value, shortcut = "", icon = "" }) {
        this._value = value;
        this._name = name;
        this._shortcut = shortcut;
        this._icon = icon;
    }
    setListener(listener) {
        this.listener = listener;
    }
    build() {
        this.el = document.createElement("div");
        this.el.classList.add("framework-contextmenu-items");
        const icon = document.createElement("div");
        icon.classList.add("framework-contextmenu-icons");
        if (this._icon) {
            getIcon(this._icon).then(svg => {
                icon.append(svg);
            });
        }
        this.el.append(icon);
        const name = document.createElement("div");
        name.innerText = this._name;
        name.classList.add("framework-contextmenu-names");
        this.el.append(name);
        const shortcut = document.createElement("div");
        shortcut.classList.add("framework-contextmenu-shortcuts");
        if (this._shortcut)
            shortcut.innerText = this._shortcut;
        this.el.append(shortcut);
        this.el.addEventListener("click", this.onEvent.bind(this, "click"));
        this.el.addEventListener("mouseenter", this.onEvent.bind(this, "mouseenter"));
        this.el.addEventListener("mouseleave", this.onEvent.bind(this, "mouseleave"));
        this.el.addEventListener("mousedown", (e) => { e.stopPropagation(); }); // block dragging
        this.el.addEventListener("contextmenu", (e) => { e.preventDefault(); }); // prevent real context-menu on fake context-menu
        return this.el;
    }
    unbuild() {
        const el = this.el;
        this.el = null;
        return el;
    }
    onEvent(type) {
        if (!this.listener)
            return;
        this.listener.trigger(type, this);
    }
    get value() { return this._value; }
    get name() { return this._name; }
    get icon() { return this._icon; }
    get shortcut() { return this._shortcut; }
    get element() { return this.el; }
}
export class ContextMenuSection {
    items;
    _name;
    listener;
    element = null;
    constructor({ items, name = null }) {
        this.items = items;
        this._name = name;
    }
    setListener(listener) {
        this.listener = listener;
        this.items.forEach(item => { item.setListener(listener); });
    }
    addItem(item) {
        this.items.push(item);
        if (this.listener)
            this.listener.trigger("add", item);
    }
    removeItem(value) {
        const item = this.getItem(value);
        if (item == null)
            return;
        const index = this.items.indexOf(item);
        item.unbuild()?.remove();
        this.items.splice(index, 1);
    }
    getItem(value) {
        if (typeof value == "number") { // given exact index
            if (value < 0)
                value += this.items.length;
            if (value >= 0 && value < this.items.length) {
                return this.items[value];
            }
            return null;
        }
        // given name
        for (const item of this.items) {
            if (item.value == value) {
                return item;
            }
        }
        return null;
    }
    build() {
        this.element = document.createElement("div");
        this.element.classList.add("framework-contextmenu-sections");
        const separator = document.createElement("div");
        separator.classList.add("framework-contextmenu-section-separators");
        this.element.append(separator);
        for (const item of this.items) {
            this.element.append(item.build());
        }
        return this.element;
    }
    unbuild() {
        for (const item of this.items) {
            this.removeItem(item.value);
        }
        const el = this.element;
        this.element = null;
        return el;
    }
    get name() { return this._name; }
    size() { return this.items.length; }
}
//# sourceMappingURL=items.js.map