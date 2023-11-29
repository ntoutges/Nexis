import { Listener } from "../../listener.js";
import { Widget } from "../widget.js";
import { ContextMenuSection } from "./items.js";
export class ContextMenu extends Widget {
    sections;
    container;
    listener = new Listener();
    constructor({ id, layer, pos, positioning, resize, style, items }) {
        const container = document.createElement("div");
        super({
            id, layer, pos, positioning, resize, style,
            name: "contextmenu",
            content: container,
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
        this.container = container;
        const sectionElements = this.sections.map(section => section.build());
        for (const sectionEl of sectionElements) {
            this.container.append(sectionEl);
        }
    }
}
//# sourceMappingURL=contextmenu.js.map