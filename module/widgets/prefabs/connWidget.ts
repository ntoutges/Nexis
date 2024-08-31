import { Channel, ClientBase, ConnectionBase } from "../../../connection/module/connBase.js";
import { JSONProtocol } from "../../../connection/module/protocols/json.js";
import { ConnectorAddon } from "../../addons/connector.js";
import { DraggableWidget } from "../draggable-widget.js";

export class ConnWidget extends DraggableWidget {
  private readonly modes = document.createElement("select");
  private readonly status = document.createElement("div");
  private readonly connectButton = document.createElement("button");
  private readonly routerIdIn = document.createElement("input");
  private readonly connIdIn = document.createElement("input");
  private readonly channelIn = document.createElement("input");

  private _connState: 0 | 1 | 2 | 3 = 0;
  private readonly connections = new Map<string, ConnectionBase<any>>();
  
  private client: ClientBase<any> = null;
  private channel: Channel = null;

  private onlyBody = false;
  private doDebugErros = false;
  
  constructor({
    type,
    connections = {},
    validator = null,
    wireData = null
  }: {
    type: string,
    validator?: (addon1: ConnectorAddon<"input" | "output">, addon2: ConnectorAddon<"input" | "output">) => boolean
    connections?: Record<string,ConnectionBase<any>>
    wireData?: ConnectorAddon<any>["wireData"]
  }) {
    const container = document.createElement("div");
    container.classList.add("nexis-prefab-connection-containers");

    super({
      content: container,
      name: "connector",
      header: {
        title: "Connectorator"
      },
      addons: {
        "input": {
          side: "left",
          addon: new ConnectorAddon<"input" | "output">({
            direction: "input",
            type,
            validator,
            wireData
          })
        },
        "forward": {
          side: "left",
          addon: new ConnectorAddon<"input" | "output">({
            direction: "input",
            type,
            validator,
            wireData,
            positioning: 0.9
          })
        },
        "output": {
          side: "right",
          addon: new ConnectorAddon<"input" | "output">({
            direction: "output",
            type,
            validator,
            wireData
          })
        },
        "debug": {
          side: "right",
          addon: new ConnectorAddon<"input" | "output">({
            direction: "output",
            type,
            validator,
            wireData,
            positioning: 0.9
          })
        }
      },
      contextmenu: {
        "header": {
          el: null,
          options: "msg/Only Body/,icons.check;err/Debug Err/,icons.check"
        }
      }
    });
    
    this.addInitParams({ type, connections, validator, wireData }, "*");
    this.defineObjectificationInitParams({"connections.*": "+conn","wireData.type": "widget", "validator": "+"});

    this.contextmenus.header.listener.on("click", (item) => {
      switch (item.value) {
        case "msg":
          this.onlyBody = (item.state == 1);
          break;
        case "err":
          this.doDebugErros = (item.state == 1);
      }
    });

    (this.addons.get("input") as ConnectorAddon<any>).sender.on("receive", (data) => {
      if (this.connState != 2) return this.setStatus("Disconnected");
      this.channel.broadcast(data);
      this.setStatus("");
    });
    (this.addons.get("forward") as ConnectorAddon<any>).sender.on("receive", (data) => {
      if (this.connState != 2) return this.setStatus("Disconnected");
      this.channel.forward(data.req);
      this.setStatus("");
    });

    container.append(this.modes);
    
    this.routerIdIn.placeholder = "Router Id";
    this.connIdIn.placeholder = "Conn Id";
    this.channelIn.placeholder = "Channel";
    this.channelIn.value = "default"
    
    this.connectButton = document.createElement("button");
    this.connectButton.innerText = "Connect";

    this.status.classList.add("nexis-prefab-connection-statuses")

    container.append(this.routerIdIn, this.connIdIn, this.channelIn, this.connectButton, this.status);

    this.connectButton.addEventListener("click", () => {
      switch(this._connState) {
        case 0: // disconnected
          if (this.connIdIn.value.trim().length == 0) return this.setStatus("Invalid Conn Id");
          if (this.channelIn.value.trim().length == 0) return this.setStatus("Invalid channel");
          this.setStatus("");
          
          this.connState = 1;
          break;
        case 1: // connecting
        case 2: // connected
          this.connState = 0;
          break;
      }
    });

    for (const name in connections) { this.addConnection(name, connections[name]); }
  }

  set connState(value: 0 | 1 | 2 | 3) {
    switch (value) {
      case 0: // disconneted
      case 3:
        this.connectButton.innerText = "Disconnecting";

        this._connState = 3; // disconnecting
        this.client.destroy().then(() => {
          this.connectButton.innerText = "Connect";
          this.client = null;
          this.channel = null;
          this._connState = 0;
        });

        this.setEditState(true);
        break;
      case 1: { // connecting
        this.connectButton.innerText = "Cancel";

        const conn = this.connections.get(this.modes.value);
        this.client = conn.buildClient(this.connIdIn.value.trim(), new JSONProtocol());
        this.channel = this.client.buildChannel(this.channelIn.value.trim());

        const routerId = this.routerIdIn.value.trim();
        if (routerId.length != 0) this.client.routerId = routerId;

        this.client.listener.on("readystatechange", (id) => {
          this.connState = 2;
        });
        
        // connect debug port
        this.client.listener.on("connect", id => { (this.addons.get("debug") as ConnectorAddon<any>).sender.trigger("send", `connect: ${id}`); });;
        this.client.listener.on("disconnect", id => { (this.addons.get("debug") as ConnectorAddon<any>).sender.trigger("send", `disconnect: ${id}`); });
        this.client.listener.on("reconnect", id => { (this.addons.get("debug") as ConnectorAddon<any>).sender.trigger("send", `reconnect: ${id}`); });
        this.client.listener.on("readystatechange", id => { (this.addons.get("debug") as ConnectorAddon<any>).sender.trigger("send", `rsc[${+this.client.getReadyState(id)}]: ${id}`); });
        this.client.errListener.onAll((type, data) => {
          if (this.doDebugErros) (this.addons.get("debug") as ConnectorAddon<any>).sender.trigger("send", `err[${type}]: ${JSON.stringify(data)}`);
          if (type == "id") this.connState = 0; // invalid id
        });

        this.channel.listener.on("message", (data) => {
          (this.addons.get("output") as ConnectorAddon<any>).sender.trigger("send", this.onlyBody ? data.req.data : data);
        });
        this.setEditState(false);
        break;
      }
      case 2: // connected
        this.connectButton.innerText = "Disconnect";
        this.setEditState(false);
        break;
    }
    this._connState = value;
  }
  get connState() { return this._connState; }

  addConnection(
    name: string,
    connection: ConnectionBase<any>
  ) {
    if (!this.connections.has(name)) {
      const option = document.createElement("option");
      option.value = name;
      option.innerText = name;
      this.modes.append(option);
    }

    if (!connection) debugger
    this.connections.set(name,connection);
  }

  private setStatus(text: string) {
    this.status.textContent = text;
  }

  private setEditState(editable: boolean) {
    this.modes.disabled = !editable;
    this.routerIdIn.disabled = !editable;
    this.connIdIn.disabled = !editable;
    this.channelIn.disabled = !editable;
  }

  wSave() {
    return {
      connType: this.modes.value,
      routerId: this.routerIdIn.value,
      connId: this.connIdIn.value,
      channel: this.channelIn.value
    };
  }

  wLoad(data: Record<string,any>) {
    if (data.connType && typeof data.connType == "string") this.modes.value = data.connType;
    if (data.routerId && typeof data.routerId == "string") this.routerIdIn.value = data.routerId;
    if (data.connId && typeof data.connId == "string") this.connIdIn.value = data.connId;
    if (data.channel && typeof data.channel == "string") this.channelIn.value = data.channel;
  }
}

export class ConnConsole extends DraggableWidget {
  private readonly terminalContainer = document.createElement("div");
  private readonly terminalBody = document.createElement("div");
  private readonly terminalInput = document.createElement("input");
  private doAutoscroll: boolean = true;
  private doPassthru: boolean = false;
  private readonly maxLines: number = 100;
  
  constructor({
    type,
    validator = null,
    wireData = null
  }: {
    type: string,
    validator?: (addon1: ConnectorAddon<"input" | "output">, addon2: ConnectorAddon<"input" | "output">) => boolean
    wireData?: ConnectorAddon<any>["wireData"]
  }) {
    const container = document.createElement("div");
    container.classList.add("nexis-prefab-connsole-containers");
    
    super({
      content: container,
      name: "connsole",
      header: {
        title: "Connsole"
      },
      addons: {
        "input": {
          side: "left",
          addon: new ConnectorAddon({
            direction: "input",
            type,
            validator,
            wireData
          })
        },
        "output": {
          side: "right",
          addon: new ConnectorAddon({
            direction: "output",
            type,
            validator,
            wireData
          })
        }
      },
      resize: "both",
      style: {
        "width": "200px",
        "height": "200px"
      },
      contextmenu: {
        "connsole": {
          el: container,
          options: "clear/Clear/icons.trash"
        },
        "header": {
          el: null,
          options: ";Options;scroll/Autoscroll/icons.check,;passthru/Passthru/,icons.check"
        }
      },
      doDragAll: true
    });

    this.addInitParams({ type, wireData, validator }, "*");
    this.defineObjectificationInitParams({"wireData.type": "wire", "validator": "+"});

    this.terminalContainer = container;
    this.terminalBody.classList.add("nexis-prefab-connsole-bodies");
    this.terminalInput.classList.add("nexis-prefab-connsole-inputs");

    container.append(this.terminalBody, this.terminalInput);

    this.terminalInput.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key == "Enter") {
        (this.addons.get("output") as ConnectorAddon<any>).sender.trigger("send", this.terminalInput.value);
        this.writeLine(this.terminalInput.value);
        this.terminalInput.value = null;
      }
    });
    
    container.addEventListener("click", this.terminalInput.focus.bind(this.terminalInput));
    container.addEventListener("wheel", (e) => {
      e.stopPropagation();
    });

    this.contextmenus.connsole.listener.on("click", (item) => {
      switch (item.value) {
        case "clear":
          this.clear();
          break;
        case "scroll":
          this.doAutoscroll = (item.state == 0);
          break;
        case "passthru":
          this.doPassthru = (item.state == 1);
          break;
      }
    });

    
    (this.addons.get("input") as ConnectorAddon<any>).sender.on("receive", (data) => {
      this.writeLine(typeof data == "string" ? data : JSON.stringify(data));
      if (this.doPassthru) (this.addons.get("output") as ConnectorAddon<any>).sender.trigger("send", data);
    });
  }

  private writeLine(text: string) {
    this.terminalBody.append(
      ...text.split("\n").map(line => {
        const lineEl = document.createElement("div");
        lineEl.textContent = "> " + line;

        lineEl.addEventListener("click", () => {
          navigator.clipboard.writeText(line);
        });
        return lineEl;
      })
    );

    // remove extra lines
    const toRemove = this.terminalBody.children.length - this.maxLines;
    for (let i = 0; i < toRemove; i++) { this.terminalBody.children[0].remove(); }

    if (this.doAutoscroll) {
      this.terminalContainer.scrollTop = this.terminalContainer.scrollHeight;
    }
  }
  private clear() {
    this.terminalInput.value = "";
    this.terminalBody.innerHTML = "";
  }

  wSave() {
    const text = this.terminalBody.innerText;
    return {
      text: text ? text.split("\n").map(line => line.replace(/^ *\> /, "")).join("\n") : null
    }
  }

  wLoad(data: Record<string,any>) {
    if (data.text || data.text == "") this.writeLine(data.text);
  }
}
