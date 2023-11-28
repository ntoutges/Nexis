import { CommonFrameworkInterface, draggableListener } from "../interfaces.js";

export type SceneListenerTypes = "dragStart" | "dragEnd" | "drag" | "zoom" | "move" | "resize" | "init";

export type sceneListener = draggableListener;

export interface CommonWidgetInterface extends CommonFrameworkInterface {
  layer?: number // higher is closer to the screen
  positioning?: number // ranges from 0-1: 0 indicates it ignores scene position, 1 indicates follows perfectly with scene movement
  pos?: {
    x?: number,
    y?: number,
    xAlign?: "left" | "middle" | "right",
    yAlign?: "top" | "middle" | "bottom"
  },
}

export interface BasicWidgetInterface extends CommonWidgetInterface {
  name: string
  content: HTMLElement
}

export interface headerOption {
  show: boolean
  dormant: {
    fill: string,
    highlight: string
  },
  active: {
    fill: string,
    highlight: string
  }
  icon: string
  size: string
  padding: string
}

export type buttonTypes = "collapse" | "close";

export interface DraggableWidgetInterface extends BasicWidgetInterface {
  options?: {
    
  }
  header?: {
    title?: string
    buttons?: Record<buttonTypes, Partial<headerOption>>,
    background?: string,
    color?: string
  }
  doCursorDragIcon?: boolean
}

export interface GridWidgetInterface extends CommonWidgetInterface {
  options?: {
    grid?: {
      size?: number
      color?: string
    }
    megagrid?: {
      size?: number
      color?: string
    },
    coords?: boolean
  }
  doCursorDragIcon?: boolean
  doIndependentCenter?: boolean
  gridChangeScaleFactor?: number
}
