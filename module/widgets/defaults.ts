import { buttonTypes, headerOption } from "./interfaces";

export const buttonDefaults: Record<buttonTypes, headerOption> = {
  "collapse": {
    show: true,
    dormant: {
      fill: "black",
      highlight: "transparent"
    },
    active: {
      fill: "black",
      highlight: "lightgrey"
    },
    icon: "icons.minus",
    size: "11px",
    padding: "2px",
  },
  "maximize": {
    show: false,
    dormant: {
      fill: "black",
      highlight: "transparent"
    },
    active: {
      fill: "black",
      highlight: "lightgrey"
    },
    icon: "icons.fullscreen-enter",
    padding: "2px",
    size: "11px"
  },
  "close": {
    show: true,
    dormant: {
      fill: "black",
      highlight: "transparent"
    },
    active: {
      fill: "black",
      highlight: "red"
    },
    icon: "icons.x",
    size: "11px",
    padding: "2px"
  }
};