// basis for everything in the module
export class FrameworkBase {
    el = document.createElement("div");
    constructor({ name, parent = null, id = null, children = [], style }) {
        this.el.classList.add("frameworks");
        const names = name.split(" ");
        for (const partialName of names) {
            this.el.classList.add(`framework-${partialName}`);
        }
        if (id)
            this.el.setAttribute("id", id);
        for (const child of children) {
            this.el.append(child);
        }
        if (parent)
            this.appendTo(parent);
        if (style) {
            for (const property in style) {
                this.el.style[property] = style[property];
            }
        }
    }
    hide() { this.el.classList.add("hiddens"); }
    show() { this.el.classList.remove("hiddens"); }
    appendTo(parent) { parent.append(this.el); }
    get element() {
        return this.el;
    }
}
//# sourceMappingURL=framework.js.map