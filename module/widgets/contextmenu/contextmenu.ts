import { ContextMenuEvents, ContextMenuItemInterface } from "../../interfaces.js";
import { Listener } from "../../listener.js";
import { Scene } from "../../scene.js";
import { GlobalSingleUseWidget } from "../globalSingleUseWidget.js";
import { ContextMenuInterface } from "../interfaces.js";
import { ContextMenuItem, ContextMenuSection } from "./items.js";

export class ContextMenu extends GlobalSingleUseWidget {
  private readonly sections: ContextMenuSection[];
  private readonly container: HTMLDivElement;
  readonly listener = new Listener<ContextMenuEvents, ContextMenuItem>();

  private length: number;

  constructor({
    id,
    layer=999999,
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
      options: {
        autobuild: false
      }
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

    this.sections.forEach(section => { section.setListener(this.listener); });
    this.container = container;
    
    this.listener.on("add", () => { if (this.isBuilt) this.rebuild(); });
  }

  private rebuild() {
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
}

// format: value//name//icon//shortcut
export function itemBuilder(input: string): ContextMenuItem {
  const parts = input.split("/");
  
  const buildData: ContextMenuItemInterface = { value: "" };

  if (parts.length == 0) return null;
  buildData.value = parts[0];
  
  if (parts.length > 1 && parts[1].trim()) buildData.name = parts[1];
  if (parts.length > 2 && parts[2].trim()) buildData.icon = parts[2];
  if (parts.length > 3 && parts[3].trim()) buildData.shortcut = parts[3];

  return new ContextMenuItem(buildData);
}

// format: ;name;<item>;<item>;...
const sectionPattern = /^(?:;([^;]+))?(.+?)$/;
export function sectionBuilder(input: string): ContextMenuSection {
  const sectionData = sectionPattern.exec(input);
  if (!sectionData) return null;

  const name = sectionData[1] ?? null;
  const items: ContextMenuItem[] = [];
  
  const itemsData = (sectionData[2] ?? "").split(";");
  for (const itemInput of itemsData) {
    const item = itemBuilder(itemInput);
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
export function sectionsBuilder(input: string): ContextMenuSection[] {
  const sectionsData = input.split("~");

  const sections: ContextMenuSection[] = [];
  for (const sectionData of sectionsData) {
    const section = sectionBuilder(sectionData);
    if (section == null) continue; // throw out
    sections.push(section);
  }

  return sections;
}
