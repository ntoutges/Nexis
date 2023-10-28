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
  }
}

export interface BasicWidgetInterface extends CommonWidgetInterface {
  name: string
  content: HTMLElement
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
  doCursorDrag?: boolean
  doIndependentCenter?: boolean
}
