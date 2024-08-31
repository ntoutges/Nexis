import { Addon } from "../addons/base.js";
import { CommonNexisInterface, draggableListener } from "../interfaces.js";
import { ContextMenuItem, ContextMenuSection } from "./contextmenuItems.js";

export type SceneListenerTypes = "dragStart" | "dragEnd" | "drag" | "zoom" | "move" | "resize" | "init";
export type sceneListener = draggableListener;
export type sceneElListener = (event: Event) => void;

export interface CommonWidgetInterface extends CommonNexisInterface {
  layer?: number // higher is closer to the screen
  positioning?: number // ranges from 0-1: 0 indicates it ignores scene position, 1 indicates follows perfectly with scene movement
  doZoomScale?: boolean // if false, ignores scaling from the scene
  pos?: {
    x?: number
    y?: number
    xAlign?: "left" | "middle" | "right"
    yAlign?: "top" | "middle" | "bottom"
  },
  contextmenu?: contextmenuType | contextmenuType[],
  addons?: Record<string, { side: "top" | "bottom" | "left" | "right", layer?: number, addon: Addon }>
}

type contextmenuType = Record<string, { el: HTMLElement | HTMLElement, options: string }>;
export interface BasicWidgetInterface extends CommonWidgetInterface {
  name: string
  content?: HTMLElement
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
  altIcon: string | null
  size: string
  padding: string
}

export type buttonTypes = "collapse" | "close" | "maximize";

export interface DraggableWidgetInterface extends BasicWidgetInterface {
  options?: {
    acceptableMouseButtons?: number[]
    bodyBackground?: string
    hideOnInactivity?: boolean
    draggable?: {
      scrollX?: boolean
      scrollY?: boolean
    }
  }
  header?: {
    title?: string
    buttons?: Partial<Record<buttonTypes, Partial<headerOption>>>
    background?: string
    color?: string
    show?: boolean
  }
  doCursorDragIcon?: boolean
  doDragAll?: boolean
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
    coords?: boolean,
    acceptedMouseButtons?: number[]
  }
  doCursorDragIcon?: boolean
  doIndependentCenter?: boolean
  gridChangeScaleFactor?: number
}

export interface GlobalSingleUseWidgetInterface extends BasicWidgetInterface {
  options?: {
    autobuild?: boolean
  }
}

export interface ContextMenuInterface extends CommonWidgetInterface {
  items: ContextMenuSection[] | ContextMenuItem[]
  trigger: HTMLElement | HTMLElement[]
}

