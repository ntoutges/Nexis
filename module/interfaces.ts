import { Scene } from "./scene.js"
import { Draggable } from "./draggable.js"
import { ContextMenuItem } from "./widgets/contextmenuItems.js";
import { Widget } from "./widgets/widget.js";

export type resizeType = "none" | "vertical" | "horizontal" | "both";
export interface CommonFrameworkInterface {
  id?: string
  style?: { // this mainly intended for debugging
    width?: string
    height?: string
    background?: string
    border?: string,
    opacity?: number
  }
  resize?: resizeType
}

export interface FrameworkBaseInterface extends CommonFrameworkInterface {
  name: string
  children?: HTMLElement[],
  parent?: HTMLElement
}

export interface SceneInterface extends CommonFrameworkInterface{
  options?: {
    scrollX?: boolean
    scrollY?: boolean
    zoomable?: boolean
  },
  parent?: HTMLElement
  widgets?: Widget[]
  doStartCentered?: boolean
}

export interface ScrollableInterface {
  viewport: HTMLElement
  element: HTMLElement | HTMLElement[]
  periphery?: HTMLElement[]
  scrollX?: boolean
  scrollY?: boolean
  zoomable?: boolean
  blockDrag?: boolean
  blockScroll?: boolean
  input?: {
    acceptableMouseButtons?: number[]
  }
}

export type basicListener = () => void;
export type draggableListener = (draggable: Draggable) => void;
export type DraggableEvents = "init" | "dragInit" | "dragEnd" | "drag" | "selected" | "scroll" | "resize";


export interface ContextMenuItemInterface {
  value: string
  name?: string
  shortcut?: string
  icon?: string
}

export interface ContextMenuSectionInterface {
  items: ContextMenuItem[]
  name?: string
}

export type ContextMenuEvents = "click" | "mouseenter" | "mouseleave" | "change" | "add" | "remove" | "open" | "close";