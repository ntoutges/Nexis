import { Widget } from "../framework.js";
export class BlockWidget extends Widget {
    constructor({ id, layer, style, positioning = 1, pos, resize }) {
        const el = document.createElement("div");
        super({
            id, layer, style,
            name: "block",
            positioning,
            pos,
            content: el,
            resize
        });
    }
}
//# sourceMappingURL=block.js.map