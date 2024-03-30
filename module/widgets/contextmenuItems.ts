import { ContextMenuEvents, ContextMenuItemInterface, ContextMenuSectionInterface } from "../interfaces.js";
import { Listener } from "../listener.js";
import { getSvg } from "../svg.js";

export class ContextMenuItem {
  private _value: string;
  private _name: string;
  private _shortcut: string;
  private _icon: string;
  private listener: Listener<ContextMenuEvents, ContextMenuItem> = null;
  
  private _iconStates: string[] = [];
  private _state: number = 0;

  private el: HTMLDivElement = null;
  
  private isEnabled: boolean = true;

  constructor({
    value,
    name=value,
    shortcut="",
    icon=""
  }: ContextMenuItemInterface) {
    this._value = value;
    this._name = name;
    this._shortcut = shortcut;

    this._iconStates = Array.isArray(icon) ? (icon.length == 0 ? [""] : icon) : [icon];
    this._icon = this._iconStates[this._state];
  }

  setListener(listener: Listener<ContextMenuEvents, ContextMenuItem>) {
    this.listener = listener;
  }

  build() {
    this.el = document.createElement("div");
    this.el.classList.add("framework-contextmenu-items");

    const icon = document.createElement("div");
    icon.classList.add("framework-contextmenu-icons");
    if (this._icon) {
      getSvg(this._icon).then(svg => {
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
    if (this._shortcut) shortcut.innerText = this._shortcut;
    this.el.append(shortcut);

    this.el.addEventListener("click", this.onclick.bind(this));
    this.el.addEventListener("mouseenter", this.onEvent.bind(this, "mouseenter"));
    this.el.addEventListener("mouseleave", this.onEvent.bind(this, "mouseleave"));

    this.updateEnabledState();
    return this.el;
  }

  unbuild() {
    const el = this.el;
    this.el = null;
    return el;
  }

  private onEvent(type: ContextMenuEvents) {
    if (!this.listener || !this.isEnabled) return;
    this.listener.trigger(type, this);
  }

  get value() { return this._value; }
  get name() { return this._name; }
  get icon() { return this._icon; }
  get shortcut() { return this._shortcut; }
  get state() { return this._state; }

  get element() { return this.el; }

  set name(name: string) {
    let wasChange = name != this._name;
    this._name = name;
    if (wasChange) this.listener.trigger("change", this);
  }

  set icon(icon: string) {
    let wasChange = icon != this._icon;
    this._icon = icon;
    if (wasChange) this.listener.trigger("change", this);
  }

  set shortcut(shortcut: string) {
    let wasChange = shortcut != this._shortcut;
    this._shortcut = shortcut;
    if (wasChange) this.listener.trigger("change", this);
  }

  set state(state: number) {
    state %= this._iconStates.length;
    if (state < 0) state += this._iconStates.length;

    let wasChange = state != this.state;
    this._state = state;
    if (wasChange) this.icon = this._iconStates[this._state];
  }

  enable() {
    this.isEnabled = true;
    this.updateEnabledState();
  }
  disable() {
    this.isEnabled = false;
    this.updateEnabledState();
  }

  private updateEnabledState() {
    if (!this.el) return; // no element to update
    if (this.isEnabled) this.el.classList.remove("framework-contextmenu-item-disabled")
    else this.el.classList.add("framework-contextmenu-item-disabled");
  }

  private onclick() {
    this.state++; // move to next state
    this.onEvent("click");
  }
}

export class ContextMenuSection {
  private items: ContextMenuItem[];
  private _name: string;
  private listener: Listener<ContextMenuEvents, ContextMenuItem>;
  
  private element: HTMLDivElement = null;

  constructor({
    items,
    name = null
  }: ContextMenuSectionInterface) {
    this.items = items;
    this._name = name;
  }

  setListener(listener: Listener<ContextMenuEvents, ContextMenuItem>) {
    this.listener = listener;
    this.items.forEach(item => { item.setListener(listener); });
  }

  addItem(item: ContextMenuItem) {
    this.items.push(item);
    if (this.listener) {
      this.listener.trigger("add", item);
      item.setListener(this.listener);
    }
  }
  
  removeItem(value: string | number) {
    const item = this.getItem(value);
    if (item == null) return;
    const index = this.items.indexOf(item);
    
    item.unbuild()?.remove();
    this.items.splice(index,1);
  }

  getItem(value: string | number): ContextMenuItem {
    if (typeof value == "number") { // given exact index
      if (value < 0) value += this.items.length;
      if (value >= 0 && value < this.items.length) {
        return this.items[value]
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
    if (this.name != null) { // section is named
      const lineL = document.createElement("div");
      const lineR = document.createElement("div");
      const name = document.createElement("div");

      name.innerText=  this.name;

      lineL.classList.add("framework-contextmenu-section-separator-lines");
      lineR.classList.add("framework-contextmenu-section-separator-lines");
      name.classList.add("framework-contextmenu-section-separator-names")

      separator.append(lineL, name, lineR);
    }

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