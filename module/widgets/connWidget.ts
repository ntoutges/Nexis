import { ConnectorAddon } from "../addons/connector.js";
import { ChannelBase, ClientBase, ConnectionBase } from "../../connection/lib/connBase.js";
import { DraggableWidget } from "./draggable-widget.js";

export class ConnWidget extends DraggableWidget {
  readonly channel: ChannelBase<any>;

  constructor(
    channel: ChannelBase<any>
  ) {
    super({
      content: document.createElement("div"),
      name: "conn",
      header: {
        title: "Conn"
      },
      addons: {
        "input": {
          addon: new ConnectorAddon<"input" | "output">({
            type: "data",
            direction: "input",
            positioning: 0.5,
            
          }),
          side: "left"
        },
        "output": {
          addon: new ConnectorAddon<"input" | "output">({
            type: "data",
            direction: "output",
            positioning: 0.5,
            
          }),
          side: "right"
        }
      },
      style: {
        width: "100px",
        height: "50px"
      },
      doDragAll: true
    });

    this.channel = channel;
    
    (this.addons.get("input") as ConnectorAddon<"input" | "output">).sender.on("receive", (data) => {
      this.channel.broadcast(data);
    });
    this.channel.listener.on("message", (data) => {
      (this.addons.get("output") as ConnectorAddon<"input" | "output">).sender.trigger("send", data.req.data)
    });
  }
}

export class ConnDisplay extends DraggableWidget {
  constructor() {
    const content = document.createElement("div");
    content.style.padding = "2px";
    content.style.background = "white";
    content.style.border = "1px black solid";
    
    super({
      content,
      name: "conn-display",
      header: {
        title: "Connection Display"
      },
      style: {
        width: "200px",
        height: "50px"
      },
      doDragAll: true,
      addons: {
        "input": {
          addon: new ConnectorAddon<"input" | "output">({
            type: "data",
            direction: "input",
            positioning: 0.5,
            
          }),
          side: "left"
        }
      },
    });

    (this.addons.get("input") as ConnectorAddon<"input" | "output">).sender.on("receive", (data) => { content.innerText = data });
  }
}

export class ConnInput extends DraggableWidget {
  constructor() {
    const content = document.createElement("div");
    const input = document.createElement("input");
    const button = document.createElement("button");
    button.innerText = "Send!";

    content.append(input, button);

    input.addEventListener("mousedown", (e) => e.stopPropagation());

    super({
      content,
      name: "conn-display",
      header: {
        title: "Connection Input"
      },
      style: {
        width: "200px",
        height: "50px"
      },
      doDragAll: true,
      addons: {
        "output": {
          addon: new ConnectorAddon<"input" | "output">({
            type: "data",
            direction: "output",
            positioning: 0.5,
            
          }),
          side: "right"
        }
      },
    });

    button.addEventListener("click", () => {
      (this.addons.get("output") as ConnectorAddon<"input" | "output">).sender.trigger("send", input.value);
    });
  }
}
