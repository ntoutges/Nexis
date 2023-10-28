import { Widget } from "./widget.js";
export class BlockWidget extends Widget {
    constructor({ id, layer, style, positioning = 1, pos }) {
        const el = document.createElement("div");
        super({
            id, layer, style,
            name: "block",
            positioning,
            pos,
            content: el
        });
    }
}
//# sourceMappingURL=block.js.map