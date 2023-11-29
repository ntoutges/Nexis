import { ContextMenuEvents } from "../../interfaces.js";
import { Listener } from "../../listener.js";
import { Scene } from "../../scene.js";
import { ContextMenuInterface } from "../interfaces.js";
import { Widget } from "../widget.js";
import { ContextMenuItem, ContextMenuSection } from "./items.js";

export class ContextMenu extends Widget {
  private readonly sections: ContextMenuSection[];
  private readonly container: HTMLDivElement;
  private readonly listener = new Listener<ContextMenuEvents, string>();

  constructor({
    id,
    layer,
    pos,
    positioning,
    resize,
    style,
    items
  }: ContextMenuInterface) {
    const container = document.createElement("div");

    super({
      id,layer,pos,positioning,resize,style,
      name: "contextmenu",
      content: container,
    });

    container.classList.add("framework-contextmenu-containers");

    if (items.length > 0) {
      if (items[0] instanceof ContextMenuSection) this.sections = items as ContextMenuSection[];
      else {
        this.sections = [
          new ContextMenuSection({
            items: items as ContextMenuItem[]
          })
        ]
      }
    }

    this.container = container;

    const sectionElements = this.sections.map(section => section.build());
    for (const sectionEl of sectionElements) {
      this.container.append(sectionEl);
    }
  }
}