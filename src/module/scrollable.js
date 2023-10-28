// allows scenes to be moved around
export class Scrollable {
    isDragging = false;
    mouseOffset = { x: 0, y: 0 };
    pos = { x: 0, y: 0 };
    scrollX;
    scrollY;
    constructor({ scene, // Initiates movement
    viewport, // continues movement
    scrollX = true, scrollY = true, zoomable = true }) {
        scene.on("mousedown", this.initDrag.bind(this));
        viewport.addEventListener("mousemove", this.doDrag.bind(this));
        viewport.addEventListener("mouseup", this.endDrag.bind(this));
        // viewport.addEventListener("mouseleave", this.endDrag.bind(this));
        this.scrollX = scrollX;
        this.scrollY = scrollY;
    }
    initDrag(e) {
        this.isDragging = true;
        this.mouseOffset.x = e.pageX;
        this.mouseOffset.y = e.pageY;
    }
    doDrag(e) {
        if (!this.isDragging)
            return;
        if (this.scrollX) {
            this.pos.x += this.mouseOffset.x - e.pageX;
            this.mouseOffset.x = e.pageX;
        }
        if (this.scrollY) {
            this.pos.y -= this.mouseOffset.y - e.pageY;
            this.mouseOffset.y = e.pageY;
        }
    }
    endDrag() {
        this.isDragging = false;
    }
}
//# sourceMappingURL=scrollable.js.map