import { Listener } from "../../listener.js";
import { GlobalSingleUseWidget } from "../globalSingleUseWidget.js";
import { ContextMenuItem, ContextMenuSection } from "./items.js";
export class ContextMenu extends GlobalSingleUseWidget {
    sections;
    container;
    listener = new Listener();
    length;
    constructor({ id, layer = 999999, pos, positioning, resize, style, items }) {
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
//# sourceMappingURL=contextmenu.js.map