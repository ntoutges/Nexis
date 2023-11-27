import { Scene } from "./scene.js"
import { Draggable } from "./draggable.js"
import { Widget } from "./widgets/widget.js"

export interface CommonFrameworkInterface {
  id?: string
  style?: { // this mainly intended for debugging
    width?: string
    height?: string
    background?: string
    border?: string,
    opacity?: number
  }
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
}

export type basicListener = () => void;
export type draggableListener = (draggable: Draggable) => void;
export type DraggableEvents = "init" | "dragInit" | "dragEnd" | "drag" | "selected" | "scroll" | "resize";