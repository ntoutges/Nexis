import { Widget } from "./widget.js";
export class ContextMenuItem {
    value;
    name;
    shortcut;
    icon;
    constructor({ value, name = value, shortcut = "", icon = "" }) {
        this.value = value;
        this.name = name;
        this.shortcut = shortcut;
        this.icon = icon;
    }
}
export class ContextMenu extends Widget {
    constructor({ id, layer, pos, positioning, resize, style, items }) {
        const container = document.createElement("div");
        super({
            id, layer, pos, positioning, resize, style,
            name: "contextmenu",
            content: container,
        });
        container.classList.add("framework-contextmenu-containers");
    }
}
//# sourceMappingURL=contextmenu.js.map