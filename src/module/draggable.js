// allows scenes to be moved around
import { Listener } from "./listener.js";
export class Draggable {
    isDragging = false;
    element;
    // measured in px
    mouseOffset = { x: 0, y: 0 };
    pos = { x: 0, y: 0, z: 1 }; // z represents (z)oom
    delta = { x: 0, y: 0, z: 0 };
    bounds = { width: 0, height: 0 };
    scrollX;
    scrollY;
    zoomable;
    listener = new Listener();
    constructor({ scene, // Initiates movement
    viewport, // continues movement
    scrollX = true, scrollY = true, zoomable = true }) {
        setTimeout(() => {
            scene.onE("mousedown", this.initDrag.bind(this));
            viewport.addEventListener("mousemove", this.doDrag.bind(this));
            viewport.addEventListener("mouseup", this.endDrag.bind(this));
            scene.onE("wheel", this.onScroll.bind(this));
            this.updateBounds();
            this.listener.setAutoResponse("init", this);
        }, 1);
        // viewport.addEventListener("mouseleave", this.endDrag.bind(this));
        this.scrollX = scrollX;
        this.scrollY = scrollY;
        this.zoomable = zoomable;
        this.element = scene.element;
        this.listener.setPollingOptions("resize", this.updateBounds.bind(this));
    }
    initDrag(e) {
        this.isDragging = true;
        this.mouseOffset.x = e.pageX;
        this.mouseOffset.y = e.pageY;
        this.listener.trigger("dragInit", this);
    }
    doDrag(e) {
        if (!this.isDragging)
            return;
        let didMove = false;
        if (this.scrollX) {
            this.delta.x = (this.mouseOffset.x - e.pageX) / this.pos.z;
            if (this.delta.x != 0)
                didMove = true;
            this.pos.x += this.delta.x;
            this.mouseOffset.x = e.pageX;
        }
        if (this.scrollY) {
            this.delta.y = (e.pageY - this.mouseOffset.y) / this.pos.z;
            if (this.delta.y != 0)
                didMove = true;
            this.pos.y -= this.delta.y;
            this.mouseOffset.y = e.pageY;
        }
        if (didMove) {
            this.delta.z = 0;
            this.listener.trigger("drag", this);
        }
    }
    endDrag() {
        if (!this.isDragging)
            return;
        this.isDragging = false;
        this.listener.trigger("dragEnd", this);
    }
    onScroll(e) {
        if (!this.zoomable || e.deltaY == 0)
            return; // don't zoom if not zoomable
        // exact position of cursor actually matters here, rather than just difference in position
        const bounds = this.element.getBoundingClientRect();
        const localX = e.pageX - bounds.left;
        const localY = e.pageY - bounds.top;
        const dir = (e.deltaY > 0) ? 1 : -1;
        this.pos.x += localX / this.pos.z;
        this.pos.y += localY / this.pos.z;
        this.pos.z -= this.pos.z / (dir * 20);
        this.pos.x -= localX / this.pos.z;
        this.pos.y -= localY / this.pos.z;
        this.listener.trigger("scroll", this);
    }
    updateBounds() {
        const width = this.element.offsetWidth;
        const height = this.element.offsetHeight;
        if (width == this.bounds.width && height == this.bounds.height)
            return null; // no difference
        this.bounds.width = width;
        this.bounds.height = height;
        return this; // truthy/there *was* a difference
    }
    offsetBy(x, y) {
        this.pos.x -= Math.round(x);
        this.pos.y -= Math.round(y);
        this.listener.trigger("drag", this);
    }
    // convert x,y in screen to x,y within transformations of scene
    toSceneSpace(x, y) {
        return [
            x / this.pos.z + this.pos.x,
            y / this.pos.z + this.pos.y
        ];
    }
    // convert x,y in scene out to to x,y without scene transformations
    toScreenSpace(x, y) {
        return [
            (x - this.pos.x) * this.pos.z,
            (y - this.pos.y) * this.pos.z
        ];
    }
}
//# sourceMappingURL=draggable.js.map