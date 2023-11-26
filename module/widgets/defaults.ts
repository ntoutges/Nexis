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
      highlight: "yellow"
    },
    icon: "minus.svg",
    size: "11px",
    padding: "2px",
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
    icon: "x.svg",
    size: "11px",
    padding: "2px"
  }
};