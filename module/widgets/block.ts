import { CommonWidgetInterface } from "./interfaces.js";
import { Widget } from "./widget.js";

export class BlockWidget extends Widget {
  constructor({
    id,layer,style,
    positioning = 1,
    pos,
    resize
  }: CommonWidgetInterface) {
    const el = document.createElement("div");

    super({
      id,layer,style,
      name: "block",
      positioning,
      pos,
      content: el,
      resize
    });
  }
}