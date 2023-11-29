import { getIcon } from "../../svg.js";
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
    build() {
        const item = document.createElement("div");
        item.classList.add("framework-contextmenu-items");
        const icon = document.createElement("div");
        icon.classList.add("framework-contextmenu-icons");
        if (this.icon) {
            getIcon(this.icon).then(svg => {
                icon.append(svg);
            });
        }
        item.append(icon);
        const name = document.createElement("div");
        name.innerText = this.name;
        name.classList.add("framework-contextmenu-names");
        item.append(name);
        const shortcut = document.createElement("div");
        shortcut.classList.add("framework-contextmenu-shortcuts");
        if (this.shortcut)
            shortcut.innerText = this.shortcut;
        item.append(shortcut);
        return item;
    }
}
export class ContextMenuSection {
    items;
    name;
    constructor({ items, name = null }) {
        this.items = items;
        this.name = name;
    }
    build() {
        const section = document.createElement("div");
        section.classList.add("framework-contextmenu-sections");
        const separator = document.createElement("div");
        separator.classList.add("framework-contextmenu-section-separators");
        section.append(separator);
        for (const item of this.items) {
            section.append(item.build());
        }
        return section;
    }
}
//# sourceMappingURL=items.js.map