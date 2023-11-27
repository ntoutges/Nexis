// allows scenes to be moved around
import { Listener } from "./listener.js";
export class Draggable {
    isDragging = false;
    elements;
    // measured in px
    mouseOffset = { x: 0, y: 0 };
    pos = { x: 0, y: 0, z: 1 }; // z represents (z)oom
    delta = { x: 0, y: 0, z: 0 };
    bounds = { width: 0, height: 0 };
    scrollX;
    scrollY;
    zoomable;
    blockDrag;
    blockScroll;
    listener = new Listener();
    constructor({ viewport, // continues movement
    element, // Initiates movement
    periphery = [], // Has event listener, but only to stop propagation
    scrollX = true, scrollY = true, zoomable = true, blockDrag = true, blockScroll = true }) {
        this.blockDrag = blockDrag;
        this.blockScroll = blockScroll;
        setTimeout(() => {
            viewport.addEventListener("mousemove", this.doDrag.bind(this));
            viewport.addEventListener("mouseup", this.endDrag.bind(this));
            if (Array.isArray(element)) {
                if (element.length == 0)
                    throw new Error("Draggable must have at least one [element] (got 0)");
                for (const el of element) {
                    el.addEventListener("mousedown", this.initDrag.bind(this));
                    el.addEventListener("wheel", this.onScroll.bind(this));
                }
            }
            else {
                element.addEventListener("mousedown", this.initDrag.bind(this));
                element.addEventListener("wheel", this.onScroll.bind(this));
            }
            for (const el of periphery) {
                if (this.blockDrag)
                    el.addEventListener("mousedown", (e) => {
                        e.stopPropagation();
                        this.listener.trigger("selected", this);
                    });
                if (this.blockScroll)
                    el.addEventListener("wheel", (e) => { e.stopPropagation(); });
            }
            this.updateBounds();
            this.listener.setAutoResponse("init", this);
        }, 1);
        // element.addEventListener("mouseleave", this.endDrag.bind(this));
        this.scrollX = scrollX;
        this.scrollY = scrollY;
        this.zoomable = zoomable;
        this.elements = Array.isArray(element) ? element : [element];
        this.listener.setPollingOptions("resize", this.updateBounds.bind(this));
    }
    initDrag(e) {
        if (this.blockDrag)
            e.stopPropagation();
        e.preventDefault();
        this.isDragging = true;
        this.mouseOffset.x = e.pageX;
        this.mouseOffset.y = e.pageY;
        this.listener.trigger("dragInit", this);
        this.listener.trigger("selected", this);
    }
    doDrag(e) {
        if (!this.isDragging)
            return;
        if (this.blockDrag)
            e.stopPropagation();
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
    endDrag(e) {
        if (!this.isDragging)
            return;
        if (this.blockDrag)
            e.stopPropagation();
        this.isDragging = false;
        this.listener.trigger("dragEnd", this);
    }
    onScroll(e) {
        if (!this.zoomable || e.deltaY == 0)
            return; // don't zoom if not zoomable
        if (this.blockScroll)
            e.stopPropagation();
        // exact position of cursor actually matters here, rather than just difference in position
        const bounds = this.getBoundingClientRect();
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
        const { width, height } = this.getBoundingClientRect();
        // console.log(width,height)
        if (width == this.bounds.width && height == this.bounds.height)
            return null; // no difference
        this.bounds.width = width;
        this.bounds.height = height;
        return this; // truthy/there *was* a difference
    }
    getBoundingClientRect() {
        let minX = null;
        let maxX = null;
        let minY = null;
        let maxY = null;
        let minRight = null;
        let minBottom = null;
        for (const el of this.elements) {
            const bounds = el.getBoundingClientRect();
            minX = Math.min(minX, bounds.left);
            maxX = Math.max(maxX, bounds.left + bounds.width);
            minY = Math.min(minY, bounds.top);
            maxY = Math.max(maxY, bounds.top + bounds.height);
            minRight = Math.min(minRight, bounds.right);
            minBottom = Math.min(minBottom, bounds.bottom);
        }
        return {
            top: minY,
            bottom: minBottom,
            left: minX,
            right: minRight,
            width: maxX - minX,
            height: maxY - minY,
        };
    }
    offsetBy(x, y) {
        this.pos.x -= Math.round(x);
        this.pos.y -= Math.round(y);
        this.listener.trigger("drag", this);
    }
    setZoom(z) {
        this.pos.z = z;
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