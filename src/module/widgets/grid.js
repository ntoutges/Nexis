import { Widget } from "./widget.js";
export class GridWidget extends Widget {
    canvas;
    ctx;
    step;
    gridColor;
    megaStep;
    megaGridColor;
    coords;
    doCursorDrag;
    doInitCenter;
    gridChangeScaleFactor;
    offset = { x: 0, y: 0 };
    constructor({ id, style, options = {}, layer = -1, // default: behind everything
    positioning = 0, doCursorDragIcon = false, doIndependentCenter = false, gridChangeScaleFactor = 0.4, resize, contextmenu = [] }) {
        const canvas = document.createElement("canvas");
        if (!Array.isArray(contextmenu))
            contextmenu = [contextmenu];
        contextmenu.push({
            "menu": {
                el: canvas,
                options: "center/Center Grid/home.svg;reset/Reset Positioning/action-undo.svg~"
            }
        });
        super({
            name: "grid",
            content: canvas,
            positioning,
            id, style,
            layer,
            resize,
            contextmenu
        });
        this.step = Math.max(options?.grid?.size, 10) || 50;
        this.gridColor = options?.grid?.color || "lightgrey";
        this.megaStep = Math.max(options?.megagrid?.size, 2) || 5;
        this.megaGridColor = options?.megagrid?.color || "grey";
        this.coords = options?.coords ?? false;
        this.doCursorDrag = doCursorDragIcon;
        this.doInitCenter = doIndependentCenter;
        this.gridChangeScaleFactor = gridChangeScaleFactor;
        if (!this.doCursorDrag)
            this.el.classList.add("no-cursor");
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.addSceneListener("move", this.drag.bind(this));
        this.addSceneListener("resize", this.resize.bind(this));
        this.addSceneListener("init", this.init.bind(this));
        this.addSceneListener("dragStart", this.dragStart.bind(this));
        this.addSceneListener("dragEnd", this.dragEnd.bind(this));
        this.contextmenus.menu.listener.on("click", item => {
            switch (item.value) {
                case "reset":
                    this.scene.draggable.setZoom(1);
                // nobreak;
                case "center":
                    this.scene.draggable.center(true);
            }
        });
    }
    drag(d) {
        this.drawGrid(d.pos.x, d.pos.y, d.bounds.width, d.bounds.height, d.pos.z);
    }
    resize(d) {
        // this.canvas.setAttribute("width", `${d.bounds.width}px`);
        // this.canvas.setAttribute("height", `${d.bounds.height}px`);
        // align with real pixels
        this.canvas.setAttribute("width", `${d.bounds.sWidth}px`);
        this.canvas.setAttribute("height", `${d.bounds.sHeight}px`);
        // set width based on DOM
        this.canvas.style.width = `${d.bounds.width}px`;
        this.canvas.style.height = `${d.bounds.height}px`;
        if (d.bounds.width != 0 && d.bounds.height != 0) { // only resize if non-NaN scale-factor
            // const scaleX = d.bounds.sWidth / d.bounds.width;
            const scaleY = d.bounds.sHeight / d.bounds.height;
            // set canvas scale (now, 1px on canvs doesn't exactly correspond to 1px on screen)
            this.ctx.setTransform(1, 0, 0, 1, 0, 0); // reset scaling (apparently?)
            this.ctx.scale(d.scale, scaleY);
        }
        this.drawGrid(d.pos.x, d.pos.y, d.bounds.width, d.bounds.height, d.pos.z);
    }
    drawGrid(xOff, yOff, width, height, zoom) {
        this.ctx.clearRect(0, 0, width, height);
        const xAdj = (xOff - this.offset.x) * zoom;
        const yAdj = (yOff - this.offset.y) * zoom;
        const scale = (1 / this.gridChangeScaleFactor) ** Math.floor(Math.log(zoom) / Math.log(this.gridChangeScaleFactor)); // magic maths that gets the answer!
        const localStep = this.step * zoom * scale;
        // standard grid
        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = this.gridColor;
        for (let x = -xAdj % localStep; x < width; x += localStep) {
            this.vLine(x, height);
        }
        for (let y = -yAdj % localStep; y < height; y += localStep) {
            this.hLine(y, width);
        }
        this.ctx.stroke();
        // megagrid
        this.ctx.beginPath();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = this.megaGridColor;
        for (let x = -xAdj % (localStep * this.megaStep); x < width; x += localStep * this.megaStep) {
            this.vLine(x, height);
        }
        for (let y = -yAdj % (localStep * this.megaStep); y < height; y += localStep * this.megaStep) {
            this.hLine(y, width);
        }
        this.ctx.stroke();
        // draw x axis
        if (yAdj <= 0 && yAdj >= -height) {
            this.ctx.beginPath();
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = "red";
            this.hLine(-yAdj, width);
            this.ctx.stroke();
        }
        // draw y axis
        if (xAdj <= 0 && xAdj >= -width) {
            this.ctx.beginPath();
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = "seagreen";
            this.vLine(-xAdj, height);
            this.ctx.stroke();
        }
        // draw point at center of graph
        if (xAdj <= 0 && xAdj >= -width && yAdj <= 0 && yAdj >= -height) {
            this.ctx.beginPath();
            this.ctx.arc(-xAdj, -yAdj, 4, 0, 2 * Math.PI);
            this.ctx.fill();
        }
        if (this.coords) {
            this.ctx.fillText(`x: ${Math.round(xOff)}`, 5, height - 5);
            this.ctx.fillText(`y: ${Math.round(yOff)}`, 5, height - 15);
        }
    }
    vLine(x, height) {
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, height);
    }
    hLine(y, width) {
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(width, y);
    }
    init(d) {
        if (this.doInitCenter) {
            this.offset.x = d.bounds.width / 2;
            this.offset.y = d.bounds.height / 2;
        }
        this.resize(d);
    }
    dragStart() {
        if (this.doCursorDrag)
            this.el.classList.add("dragging");
    }
    dragEnd() {
        this.el.classList.remove("dragging");
    }
}
//# sourceMappingURL=grid.js.map