import { Draggable } from "../draggable.js";
import { GridWidgetInterface } from "./interfaces.js";
import { Widget } from "./widget.js";

export class GridWidget extends Widget {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  
  private step: number;
  private gridColor: string;
  private megaStep: number;
  private megaGridColor: string;
  private coords: boolean;
  private doCursorDrag: boolean;
  private readonly doInitCenter: boolean;

  private readonly offset = { x: 0, y: 0 };

  constructor({
    id,style,
    options = {},
    layer,
    positioning = 0,
    doCursorDragIcon = false,
    doIndependentCenter = false
  }: GridWidgetInterface) {
    const canvas = document.createElement("canvas");

    super({
      name: "grid",
      content: canvas,
      positioning,
      id,style,
      layer
    });

    this.step = Math.max(options?.grid?.size, 10) || 50;
    this.gridColor = options?.grid?.color || "lightgrey";
    
    this.megaStep = Math.max(options?.megagrid?.size, 2) || 3;
    this.megaGridColor = options?.megagrid?.color || "grey";

    this.coords = options?.coords ?? false;
    this.doCursorDrag = doCursorDragIcon;
    this.doInitCenter = doIndependentCenter;

    if (!this.doCursorDrag) this.el.classList.add("no-cursor");

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.addSceneListener("move", this.drag.bind(this));
    this.addSceneListener("resize", this.resize.bind(this));
    this.addSceneListener("init", this.init.bind(this));
    this.addSceneListener("dragStart", this.dragStart.bind(this));
    this.addSceneListener("dragEnd", this.dragEnd.bind(this));
  }

  protected drag(d: Draggable) {
    this.drawGrid(
      d.pos.x,
      d.pos.y,
      d.bounds.width,
      d.bounds.height,
      d.pos.z
    );
  }
  
  protected resize(d: Draggable) {
    this.canvas.setAttribute("width", `${d.bounds.width}px`);
    this.canvas.setAttribute("height", `${d.bounds.height}px`);
    this.drawGrid(
      d.pos.x,
      d.pos.y,
      d.bounds.width,
      d.bounds.height,
      d.pos.z
    );
  }

  private drawGrid(
    xOff: number,
    yOff: number,
    width: number,
    height: number,
    zoom: number
  ) {
    this.ctx.clearRect(0,0,width,height);
    
    const xAdj = (xOff - this.offset.x) * zoom;
    const yAdj = (yOff - this.offset.y) * zoom;

    const localStep = this.step * zoom;

    // standard grid
    this.ctx.beginPath();
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = this.gridColor;
    for(let x = -xAdj % localStep; x < width; x += localStep) {
      this.vLine(x, height);
    }
    for(let y = -yAdj % localStep; y < height; y += localStep) {
      this.hLine(y, width);
    }
    this.ctx.stroke();

    // megagrid
    this.ctx.beginPath();
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = this.megaGridColor;
    for(let x = -xAdj % (localStep * this.megaStep); x < width; x += localStep * this.megaStep) {
      this.vLine(x, height);
    }
    for(let y = -yAdj % (localStep * this.megaStep); y < height; y += localStep * this.megaStep) {
      this.hLine(y, width);
    }
    this.ctx.stroke();

    // draw x axis
    if (yAdj <= 0 && yAdj >= -height) {
      this.ctx.beginPath();
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = "red";
      this.hLine(-yAdj, width);
      this.ctx.stroke();
    }

    // draw y axis
    if (xAdj <= 0 && xAdj >= -width) {
      this.ctx.beginPath();
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = "seagreen";
      this.vLine(-xAdj, height);
      this.ctx.stroke();
    }

    // draw point at center of graph
    if (xAdj <= 0 && xAdj >= -width && yAdj <= 0 && yAdj >= -height) {
      this.ctx.beginPath();
      this.ctx.arc(-xAdj,-yAdj, 4,0,2*Math.PI);
      this.ctx.fill();
    }

    if (this.coords) {
      this.ctx.fillText(`x: ${Math.round(xOff)}`, 5,height - 5);
      this.ctx.fillText(`y: ${Math.round(yOff)}`, 5,height - 15);
    }
  }

  protected vLine(x: number, height: number) {
    this.ctx.moveTo(x,0);
    this.ctx.lineTo(x,height);
  }

  protected hLine(y: number, width: number) {
    this.ctx.moveTo(0,y);
    this.ctx.lineTo(width,y);
  }

  protected init(d: Draggable) {
    if (this.doInitCenter) {
      this.offset.x = d.bounds.width / 2;
      this.offset.y = d.bounds.height / 2;
    }
    this.resize(d);
  }

  protected dragStart() {
    if (this.doCursorDrag) this.el.classList.add("dragging");
  }
  protected dragEnd() {
    this.el.classList.remove("dragging");
  }
}